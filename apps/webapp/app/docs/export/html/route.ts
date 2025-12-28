import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

// Path to the pre-generated markdown file
const EXPORT_FILE = join(process.cwd(), 'public', 'docs', 'vexa-api-documentation.md');

export async function GET() {
  try {
    if (!existsSync(EXPORT_FILE)) {
      return new NextResponse('Documentation not found', { 
        status: 404,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    const markdown = await readFile(EXPORT_FILE, 'utf-8');
    
    // Convert markdown to HTML using unified
    const processor = unified()
      .use(remarkParse) // Parse markdown
      .use(remarkGfm) // GitHub Flavored Markdown support
      .use(remarkRehype) // Convert to HTML AST
      .use(rehypeStringify); // Convert to HTML string
    
    const html = await processor.process(markdown);
    const htmlString = String(html);
    
    // Wrap in minimal HTML structure for LLM consumption
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vexa API Documentation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
      background: #fff;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: 600;
    }
    h1 { font-size: 2em; border-bottom: 2px solid #eaecef; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
    h3 { font-size: 1.25em; }
    code {
      background-color: #f6f8fa;
      border-radius: 3px;
      padding: 2px 6px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 0.9em;
    }
    pre {
      background-color: #f6f8fa;
      border-radius: 6px;
      padding: 16px;
      overflow-x: auto;
      line-height: 1.45;
    }
    pre code {
      background-color: transparent;
      padding: 0;
      font-size: 0.85em;
    }
    blockquote {
      border-left: 4px solid #dfe2e5;
      padding-left: 16px;
      color: #6a737d;
      margin: 0;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    table th, table td {
      border: 1px solid #dfe2e5;
      padding: 6px 13px;
    }
    table th {
      background-color: #f6f8fa;
      font-weight: 600;
    }
    ul, ol {
      padding-left: 2em;
    }
    a {
      color: #0366d6;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    hr {
      border: none;
      border-top: 1px solid #eaecef;
      margin: 2em 0;
    }
  </style>
</head>
<body>
${htmlString}
</body>
</html>`;
    
    return new NextResponse(fullHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating HTML:', error);
    return new NextResponse(
      `Error generating HTML: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { 
        status: 500,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      }
    );
  }
}

