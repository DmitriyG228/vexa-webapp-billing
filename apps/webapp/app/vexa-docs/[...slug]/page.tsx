import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllVexaDocSlugs, getVexaDocBySlug } from "@/lib/vexa-docs";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return getAllVexaDocSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getVexaDocBySlug(slug);
  if (!doc) return { title: "Not found" };
  return {
    title: `${doc.title} | Vexa Docs`,
    description: doc.description,
  };
}

export default async function VexaDocPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const doc = await getVexaDocBySlug(slug);
  if (!doc) notFound();

  return (
    <article
      className="prose prose-lg dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: doc.contentHtml }}
    />
  );
}

