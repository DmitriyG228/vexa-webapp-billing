import { permanentRedirect } from "next/navigation";

export default async function VexaDocPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const path = Array.isArray(slug) ? slug.join("/") : "";
  permanentRedirect(`https://docs.vexa.ai/${path}`);
}
