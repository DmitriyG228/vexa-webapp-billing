import { Metadata } from "next";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { CopyMarkdownButton } from "@/components/docs/copy-markdown-button";

export const metadata: Metadata = {
  title: "Export API Documentation | Vexa API Docs",
  description: "Download complete Vexa API documentation as a single markdown file for ChatGPT, documentation tools, or offline reference",
  openGraph: {
    title: "Export API Documentation | Vexa API Docs",
    description: "Download complete Vexa API documentation as a single markdown file",
  },
};

// Path to the pre-generated markdown file
const EXPORT_FILE = join(process.cwd(), "public", "docs", "vexa-api-documentation.md");

async function getMarkdownInfo() {
  try {
    if (existsSync(EXPORT_FILE)) {
      const content = await readFile(EXPORT_FILE, "utf-8");
      const sizeKB = Math.round(content.length / 1024);
      const stats = await import("fs/promises").then(fs => fs.stat(EXPORT_FILE));
      return {
        exists: true,
        sizeKB,
        lastModified: stats.mtime,
      };
    }
    return { exists: false, sizeKB: 0, lastModified: null };
  } catch (error) {
    console.error("Error reading export file:", error);
    return { exists: false, sizeKB: 0, lastModified: null };
  }
}

export default async function ExportDocsPage() {
  const info = await getMarkdownInfo();

  if (!info.exists) {
    notFound();
  }

  const downloadUrl = "/docs/vexa-api-documentation.md";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Export API Documentation</h1>
        <p className="text-muted-foreground mt-2">
          Download the complete Vexa API documentation as a single markdown file for use with ChatGPT, documentation tools, or offline reference.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pre-generated Documentation</CardTitle>
          <CardDescription>
            The documentation is automatically generated and updated regularly.
            {info.lastModified && (
              <span className="block mt-1">
                Last updated: {info.lastModified.toLocaleDateString()} {info.lastModified.toLocaleTimeString()}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              File size: {info.sizeKB} KB
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button asChild variant="default" className="gap-2">
              <a href={downloadUrl} download="vexa-api-documentation.md">
                <Download className="h-4 w-4" />
                Download Markdown File
              </a>
            </Button>
            <CopyMarkdownButton url={downloadUrl} />
          </div>
        </CardContent>
      </Card>

      <div className="prose prose-sm max-w-none">
        <h2>How to Use</h2>
        <ul>
          <li>
            <strong>Download:</strong> Click "Download Markdown File" to save the documentation as a markdown file.
          </li>
          <li>
            <strong>Copy to Clipboard:</strong> Click "Copy to Clipboard" to copy the entire documentation for pasting into ChatGPT or other tools.
          </li>
          <li>
            <strong>Direct Link:</strong> You can also access the markdown file directly at{" "}
            <code className="text-sm bg-muted px-1 py-0.5 rounded">{downloadUrl}</code>
          </li>
        </ul>
        
        <h2>What's Included</h2>
        <p>
          The exported documentation includes all API endpoints, WebSocket events, cookbook guides, and examples from the Vexa API documentation.
        </p>
      </div>
    </div>
  );
}
