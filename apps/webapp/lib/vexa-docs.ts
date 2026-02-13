import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";

const DOCS_DIR = path.join(process.cwd(), "content", "vexa-docs");

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const out: string[] = [];
  for (const ent of entries) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function isMarkdownFile(p: string) {
  return p.endsWith(".md") || p.endsWith(".mdx");
}

function slugPartsFromRelPath(relPath: string): string[] {
  const noExt = relPath.replace(/\.mdx?$/, "");
  const parts = noExt.split(path.sep).filter(Boolean);
  if (parts.length > 0 && parts[parts.length - 1].toLowerCase() === "readme") {
    // Directory index: docs/foo/README.md => /vexa-docs/foo
    return parts.slice(0, -1);
  }
  return parts;
}

export function getAllVexaDocSlugs(): string[][] {
  const files = walk(DOCS_DIR).filter(isMarkdownFile);
  const slugs = files
    .map((abs) => slugPartsFromRelPath(path.relative(DOCS_DIR, abs)))
    .filter((parts) => parts.length > 0);
  // Stable sort so builds don't flap.
  slugs.sort((a, b) => a.join("/").localeCompare(b.join("/")));
  return slugs;
}

function tryReadFile(p: string): string | null {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

function resolveDocFile(slugParts: string[]): { absPath: string; content: string } | null {
  const rel = slugParts.join(path.sep);
  const candidates = [
    path.join(DOCS_DIR, `${rel}.md`),
    path.join(DOCS_DIR, `${rel}.mdx`),
    path.join(DOCS_DIR, rel, "README.md"),
    path.join(DOCS_DIR, rel, "README.mdx"),
  ];
  for (const abs of candidates) {
    const content = tryReadFile(abs);
    if (content != null) return { absPath: abs, content };
  }
  return null;
}

function splitHref(href: string): { pathPart: string; hash: string } {
  const idx = href.indexOf("#");
  if (idx === -1) return { pathPart: href, hash: "" };
  return { pathPart: href.slice(0, idx), hash: href.slice(idx) };
}

function rewriteHtmlLinksAndImages(html: string, slugParts: string[]): string {
  const currentDirParts = slugParts.slice(0, -1);
  const currentDir = currentDirParts.join("/");

  const resolveRel = (raw: string) => {
    const joined = path.posix.normalize(path.posix.join(currentDir, raw));
    // Prevent escaping the docs root.
    return joined.replace(/^(\.\.\/)+/g, "");
  };

  // Images: make relative src point to our synced static assets.
  html = html.replace(/<img([^>]*?)src="([^"]+)"([^>]*)>/g, (m, before, src, after) => {
    if (
      src.startsWith("http://") ||
      src.startsWith("https://") ||
      src.startsWith("data:") ||
      src.startsWith("/")
    ) {
      return m;
    }
    const resolved = resolveRel(src);
    return `<img${before}src="/vexa-docs-static/${resolved}"${after}>`;
  });

  // Anchors: rewrite relative markdown links to internal docs routes.
  html = html.replace(/<a([^>]*?)href="([^"]+)"([^>]*)>/g, (m, before, href, after) => {
    if (
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("mailto:") ||
      href.startsWith("#") ||
      href.startsWith("/")
    ) {
      return m;
    }

    const { pathPart, hash } = splitHref(href);
    const resolved = resolveRel(pathPart);
    const withoutExt = resolved.replace(/\.mdx?$/i, "");
    const target = `/vexa-docs/${withoutExt}${hash}`;
    return `<a${before}href="${target}"${after}>`;
  });

  return html;
}

export type VexaDoc = {
  slugParts: string[];
  title: string;
  description?: string;
  contentHtml: string;
};

export async function getVexaDocBySlug(slugParts: string[]): Promise<VexaDoc | null> {
  const resolved = resolveDocFile(slugParts);
  if (!resolved) return null;

  const { content } = resolved;
  const parsed = matter(content);

  const processed = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypePrettyCode, { theme: "github-dark" })
    .use(rehypeStringify)
    .process(parsed.content);

  let contentHtml = processed.toString();
  contentHtml = rewriteHtmlLinksAndImages(contentHtml, slugParts);

  // Title fallback: first markdown H1, then slug.
  const fmTitle = (parsed.data as any)?.title;
  const firstH1 = parsed.content.match(/^#\s+(.+)\s*$/m)?.[1]?.trim();
  const title = (fmTitle || firstH1 || slugParts[slugParts.length - 1] || "Docs").toString();

  const description = (parsed.data as any)?.description || (parsed.data as any)?.summary;

  return { slugParts, title, description, contentHtml };
}

