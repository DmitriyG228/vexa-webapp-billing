import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// List of all docs pages to include
const docsPages = [
  { path: '/docs', title: 'Overview' },
  { path: '/docs/auth', title: 'Authentication' },
  { path: '/docs/rest/meetings', title: 'REST API - Meetings' },
  { path: '/docs/rest/bots', title: 'REST API - Bots' },
  { path: '/docs/rest/transcripts', title: 'REST API - Transcripts' },
  { path: '/docs/ws', title: 'WebSocket API - Overview' },
  { path: '/docs/ws/subscribe', title: 'WebSocket API - Subscribe' },
  { path: '/docs/ws/events', title: 'WebSocket API - Events' },
  { path: '/docs/cookbook/start-transcription', title: 'Cookbook - Start Transcription' },
  { path: '/docs/cookbook/track-meeting-status', title: 'Cookbook - Track Meeting Status' },
  { path: '/docs/cookbook/get-transcripts', title: 'Cookbook - Get Transcripts' },
  { path: '/docs/cookbook/live-transcripts', title: 'Cookbook - Live Transcripts' },
  { path: '/docs/cookbook/share-transcript-url', title: 'Cookbook - Share Transcript URL' },
  { path: '/docs/cookbook/rename-meeting', title: 'Cookbook - Rename Meeting' },
  { path: '/docs/cookbook/get-status-history', title: 'Cookbook - Get Status History' },
  { path: '/docs/cookbook/stop-bot', title: 'Cookbook - Stop Bot' },
  { path: '/docs/admin/users', title: 'Admin API - Users' },
  { path: '/docs/admin/tokens', title: 'Admin API - Tokens' },
];

// Simple HTML to Markdown converter
function htmlToMarkdown(html: string): string {
  let md = html
    // Extract code blocks with language first (before processing other code tags)
    .replace(/<pre[^>]*><code[^>]*class=["'][^"']*language-([^"'\s]+)[^"']*["'][^>]*>(.*?)<\/code><\/pre>/gis, (match, lang, code) => {
      // Clean up the code content
      const cleanCode = code
        .replace(/<[^>]+>/g, '') // Remove any nested HTML
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      return `\`\`\`${lang}\n${cleanCode}\n\`\`\`\n\n`;
    })
    // Then handle code blocks without language
    .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, (match, code) => {
      const cleanCode = code
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      return `\`\`\`\n${cleanCode}\n\`\`\`\n\n`;
    })
    // Headings
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
    // Bold
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    // Italic
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    // Inline code (but not inside pre blocks which we already handled)
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    // Links
    .replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    // Lists - handle nested lists better
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ol[^>]*>/gi, '\n')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, (match, content) => {
      // Clean content
      const clean = content
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      return `- ${clean.trim()}\n`;
    })
    // Paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    // Line breaks
    .replace(/<br[^>]*\/?>/gi, '\n')
    // Tables (basic support)
    .replace(/<table[^>]*>/gi, '\n\n')
    .replace(/<\/table>/gi, '\n\n')
    .replace(/<thead[^>]*>/gi, '')
    .replace(/<\/thead>/gi, '')
    .replace(/<tbody[^>]*>/gi, '')
    .replace(/<\/tbody>/gi, '')
    .replace(/<tr[^>]*>/gi, '\n')
    .replace(/<\/tr>/gi, '')
    .replace(/<th[^>]*>(.*?)<\/th>/gi, '| $1 ')
    .replace(/<td[^>]*>(.*?)<\/td>/gi, '| $1 ')
    // Remove all other HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    // Clean up leading/trailing whitespace on lines
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trim();

  return md;
}

// Extract text content from React component file
async function extractContentFromPage(filePath: string): Promise<string> {
  try {
    const content = await readFile(filePath, 'utf-8');
    
    // Extract metadata title
    const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
    const title = titleMatch ? titleMatch[1] : '';
    
    // Extract description
    const descMatch = content.match(/description:\s*["']([^"']+)["']/);
    const description = descMatch ? descMatch[1] : '';
    
    // Try to extract JSX content - this is a simplified approach
    // For a more robust solution, we'd need to actually render the components
    let textContent = content
      // Remove imports
      .replace(/import\s+.*?from\s+["'][^"']+["'];?\n/g, '')
      // Extract string literals from JSX
      .match(/>\s*["']([^"']+)["']\s*</g)?.join('\n').replace(/[><"']/g, '') || '';
    
    return `# ${title}\n\n${description ? `${description}\n\n` : ''}${textContent}`;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return '';
  }
}

// Path to save the pre-generated markdown file
const EXPORT_FILE = join(process.cwd(), 'public', 'docs', 'vexa-api-documentation.md');

async function generateMarkdown(baseUrl: string): Promise<string> {
  const markdownSections: string[] = [];
  
  markdownSections.push('# Vexa API Documentation\n\n');
  markdownSections.push('Complete API reference for Vexa meeting transcription platform.\n\n');
  markdownSections.push(`*Generated automatically from the Vexa API documentation on ${new Date().toISOString()}.*\n\n`);
  markdownSections.push('---\n\n');
  
  // For each docs page, fetch its content
  for (const page of docsPages) {
    try {
      const pageUrl = `${baseUrl}${page.path}`;
      const response = await fetch(pageUrl, {
        headers: {
          'User-Agent': 'Vexa-Docs-Exporter/1.0',
          'Accept': 'text/html',
        },
        cache: 'no-store',
      });
      
      if (response.ok) {
        const html = await response.text();
        
        // Extract main content from HTML - look for the docs content area
        const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
        const contentMatch = html.match(/<div[^>]*max-w-4xl[^>]*>([\s\S]*?)<\/div>/i);
        let content = mainMatch?.[1] || contentMatch?.[1] || '';
        
        // If we found content, clean it up and convert to markdown
        if (content) {
          // Remove script tags and their content
          content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
          // Remove style tags and their content
          content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
          // Remove nav elements
          content = content.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
          // Remove header elements
          content = content.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
          // Remove footer elements
          content = content.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
          
          const markdown = htmlToMarkdown(content);
          
          if (markdown.trim().length > 0) {
            markdownSections.push(`## ${page.title}\n\n`);
            markdownSections.push(markdown);
            markdownSections.push('\n\n---\n\n');
          }
        }
      } else {
        console.warn(`Failed to fetch ${page.path}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error fetching ${page.path}:`, error);
      // Continue with other pages
    }
  }
  
  return markdownSections.join('\n');
}

async function saveMarkdown(markdown: string): Promise<void> {
  try {
    const dir = join(process.cwd(), 'public', 'docs');
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    await writeFile(EXPORT_FILE, markdown, 'utf-8');
    console.log(`[docs-export] Saved markdown to ${EXPORT_FILE}`);
  } catch (error) {
    console.error('[docs-export] Failed to save markdown:', error);
    // Don't throw - saving is optional
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const regenerate = url.searchParams.get('regenerate') === 'true';
    
    // Try to read from static file first (unless regenerating)
    if (!regenerate && existsSync(EXPORT_FILE)) {
      try {
        const markdown = await readFile(EXPORT_FILE, 'utf-8');
        return new NextResponse(markdown, {
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Content-Disposition': 'attachment; filename="vexa-api-documentation.md"',
            'X-Cache': 'hit',
          },
        });
      } catch (error) {
        console.warn('[docs-export] Failed to read static file, regenerating:', error);
      }
    }
    
    // Generate new markdown
    const baseUrl = `${url.protocol}//${url.host}`;
    const fullMarkdown = await generateMarkdown(baseUrl);
    
    // If we didn't get any content, return an error
    if (fullMarkdown.split('---').length <= 2) {
      return NextResponse.json(
        { 
          error: 'Failed to generate markdown export. Make sure the webapp is running and accessible.',
          details: 'Could not fetch documentation pages. Please ensure the server is running.'
        },
        { status: 500 }
      );
    }
    
    // Save to static file (async, don't wait)
    saveMarkdown(fullMarkdown).catch(err => {
      console.error('[docs-export] Background save failed:', err);
    });
    
    return new NextResponse(fullMarkdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'attachment; filename="vexa-api-documentation.md"',
        'X-Cache': regenerate ? 'regenerated' : 'miss',
      },
    });
  } catch (error) {
    console.error('Error generating markdown:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate markdown export',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

