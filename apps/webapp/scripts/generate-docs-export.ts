#!/usr/bin/env tsx
/**
 * Script to generate the docs export markdown file
 * Run this script to regenerate the static markdown export
 * Usage: npm run generate-docs-export
 *        or: make generate-docs-export
 */

import { writeFile, mkdir } from 'fs/promises';
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

// Simple HTML to Markdown converter (same as in API route)
function htmlToMarkdown(html: string): string {
  let md = html
    // Extract code blocks with language first
    .replace(/<pre[^>]*><code[^>]*class=["'][^"']*language-([^"'\s]+)[^"']*["'][^>]*>(.*?)<\/code><\/pre>/gis, (match, lang, code) => {
      const cleanCode = code
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      return `\`\`\`${lang}\n${cleanCode}\n\`\`\`\n\n`;
    })
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
    // Bold, italic, code, links, lists, paragraphs, tables
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ol[^>]*>/gi, '\n')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, (match, content) => {
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
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<br[^>]*\/?>/gi, '\n')
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
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trim();

  return md;
}

async function generateMarkdown(baseUrl: string): Promise<string> {
  const markdownSections: string[] = [];
  
  markdownSections.push('# Vexa API Documentation\n\n');
  markdownSections.push('Complete API reference for Vexa meeting transcription platform.\n\n');
  markdownSections.push(`*Generated automatically from the Vexa API documentation on ${new Date().toISOString()}.*\n\n`);
  markdownSections.push('---\n\n');
  
  for (const page of docsPages) {
    try {
      const pageUrl = `${baseUrl}${page.path}`;
      console.log(`Fetching ${page.path}...`);
      
      const response = await fetch(pageUrl, {
        headers: {
          'User-Agent': 'Vexa-Docs-Exporter/1.0',
          'Accept': 'text/html',
        },
        cache: 'no-store',
      });
      
      if (response.ok) {
        const html = await response.text();
        
        const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
        const contentMatch = html.match(/<div[^>]*max-w-4xl[^>]*>([\s\S]*?)<\/div>/i);
        let content = mainMatch?.[1] || contentMatch?.[1] || '';
        
        if (content) {
          content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
          content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
          content = content.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
          content = content.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
          content = content.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
          
          const markdown = htmlToMarkdown(content);
          
          if (markdown.trim().length > 0) {
            markdownSections.push(`## ${page.title}\n\n`);
            markdownSections.push(markdown);
            markdownSections.push('\n\n---\n\n');
            console.log(`✓ ${page.title}`);
          }
        }
      } else {
        console.warn(`⚠ Failed to fetch ${page.path}: ${response.status}`);
      }
    } catch (error) {
      console.error(`✗ Error fetching ${page.path}:`, error);
    }
  }
  
  return markdownSections.join('\n');
}

async function main() {
  const baseUrl = process.env.NEXT_PUBLIC_WEBAPP_URL || process.env.WEBAPP_URL || 'http://localhost:3002';
  const exportFile = join(process.cwd(), 'public', 'docs', 'vexa-api-documentation.md');
  
  console.log(`Generating docs export from ${baseUrl}...`);
  console.log(`Output: ${exportFile}\n`);
  
  try {
    const markdown = await generateMarkdown(baseUrl);
    
    if (markdown.split('---').length <= 2) {
      console.error('Error: Generated markdown is too short. Make sure the webapp is running.');
      process.exit(1);
    }
    
    const dir = join(process.cwd(), 'public', 'docs');
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    
    await writeFile(exportFile, markdown, 'utf-8');
    
    const sizeKB = Math.round(markdown.length / 1024);
    console.log(`\n✓ Successfully generated ${sizeKB} KB markdown file`);
    console.log(`  Saved to: ${exportFile}`);
  } catch (error) {
    console.error('Error generating markdown:', error);
    process.exit(1);
  }
}

main();

