#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Option A docs sync:
 * - Fetch Vexa repo docs at build/dev time (git clone/fetch).
 * - Copy markdown into `content/vexa-docs/` for rendering.
 * - Copy full `docs/` tree into `public/vexa-docs/` so relative images work.
 *
 * Env:
 * - VEXA_DOCS_REPO (default: https://github.com/Vexa-ai/vexa.git)
 * - VEXA_DOCS_REF  (default: main)
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function sh(cmd, opts = {}) {
  execSync(cmd, { stdio: "inherit", ...opts });
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function emptyDir(p) {
  fs.rmSync(p, { recursive: true, force: true });
  ensureDir(p);
}

function main() {
  const repo = process.env.VEXA_DOCS_REPO || "https://github.com/Vexa-ai/vexa.git";
  const ref = process.env.VEXA_DOCS_REF || "main";

  const root = process.cwd();
  const cacheDir = path.join(root, ".cache", "vexa-docs");
  const contentDir = path.join(root, "content", "vexa-docs");
  const publicDir = path.join(root, "public", "vexa-docs-static");

  ensureDir(path.join(root, ".cache"));

  if (!fs.existsSync(path.join(cacheDir, ".git"))) {
    console.log(`[vexa-docs] cloning ${repo} (${ref})...`);
    // Works for branches/tags. For SHAs, set VEXA_DOCS_REF to a tag/branch.
    sh(`git clone --depth 1 --branch ${ref} ${repo} ${cacheDir}`);
  } else {
    console.log(`[vexa-docs] fetching ${repo} (${ref})...`);
    sh(`git -C ${cacheDir} fetch --depth 1 origin ${ref}`);
    sh(`git -C ${cacheDir} checkout --force FETCH_HEAD`);
  }

  const srcDocsDir = path.join(cacheDir, "docs");
  if (!fs.existsSync(srcDocsDir)) {
    throw new Error(`[vexa-docs] missing docs/ directory in repo at ${cacheDir}`);
  }

  console.log("[vexa-docs] syncing content...");
  emptyDir(contentDir);
  // Copy markdown only (docs/*.md + nested), excluding large binaries if any.
  // We keep all files in public sync below for assets.
  fs.cpSync(srcDocsDir, contentDir, {
    recursive: true,
    filter: (src) => {
      if (fs.statSync(src).isDirectory()) return true;
      return src.endsWith(".md") || src.endsWith(".mdx");
    },
  });

  console.log("[vexa-docs] syncing public assets...");
  emptyDir(publicDir);
  // Only copy non-markdown files to avoid route conflicts and to keep docs content server-only.
  fs.cpSync(srcDocsDir, publicDir, {
    recursive: true,
    filter: (src) => {
      if (fs.statSync(src).isDirectory()) return true;
      return !src.endsWith(".md") && !src.endsWith(".mdx");
    },
  });

  console.log("[vexa-docs] done.");
}

main();
