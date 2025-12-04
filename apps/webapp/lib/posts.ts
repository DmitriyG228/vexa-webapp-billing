import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeStringify from 'rehype-stringify';
// Copy script is injected at the page level; no import needed here
import { GitHubContentService } from './github';

const githubService = new GitHubContentService();

export interface PostData {
  slug: string;
  title: string;
  date: string;
  author: string;
  authorImage?: string; // Optional author image URL
  authorLinkedIn?: string; // Optional author LinkedIn URL
  heroImage?: string; // Optional hero image URL
  summary: string;
  contentHtml?: string; // Optional for list view
  [key: string]: any; // Allow other frontmatter fields
}

export async function getSortedPostsData(): Promise<PostData[]> {
  try {
    const files = await githubService.getMarkdownFiles();
    
    console.log('GitHub files found:', files.map(f => ({ name: f.name, path: f.path })));
    
    const allPostsData = await Promise.all(
      files.map(async (file) => {
        const fileContents = await githubService.getFileContent(file.path);
        const matterResult = matter(fileContents);

        // Use slug from frontmatter if available, otherwise use filename
        const slug = (matterResult.data as any).slug || file.name.replace(/\.mdx?$/, '');
        
        // Debug: Log the parsed frontmatter and file info
        console.log(`File: ${file.name} (${file.path}) -> Slug: ${slug}`, {
          frontmatter: matterResult.data,
          filename: file.name,
          filepath: file.path
        });

        return {
          slug,
          filename: file.name,
          filepath: file.path,
          ...(matterResult.data as { title: string; date: string; author: string; summary: string; }),
        };
      })
    );

    // Debug: Log all slugs to check for duplicates
    const slugs = allPostsData.map(post => post.slug);
    console.log('All generated slugs:', slugs);

    // Handle duplicate slugs by adding index suffix
    const slugMap = new Map<string, number>();
    const processedPosts = allPostsData.map(post => {
      const originalSlug = post.slug;
      const count = slugMap.get(originalSlug) || 0;
      slugMap.set(originalSlug, count + 1);

      if (count > 0) {
        // If this slug already exists, add a suffix
        post.slug = `${originalSlug}-${count}`;
        console.warn(`Duplicate slug "${originalSlug}" resolved to "${post.slug}" for file: ${post.filename}`);
      }

      return post;
    });

    // Check for any remaining duplicates after processing
    const finalSlugs = processedPosts.map(post => post.slug);
    const remainingDuplicates = finalSlugs.filter((slug, index) => finalSlugs.indexOf(slug) !== index);
    if (remainingDuplicates.length > 0) {
      console.error('Remaining duplicate slugs after processing:', remainingDuplicates);
    }

    // Sort posts by date
    return processedPosts.sort((a, b) => {
      if (a.date < b.date) {
        return 1;
      } else {
        return -1;
      }
    });
  } catch (error) {
    console.error('Error fetching posts from GitHub:', error);
    return [];
  }
}

export async function getAllPostSlugs() {
  try {
    const files = await githubService.getMarkdownFiles();

    const slugs = await Promise.all(
      files.map(async (file) => {
        const fileContents = await githubService.getFileContent(file.path);
        const matterResult = matter(fileContents);

        // Use slug from frontmatter if available, otherwise use filename
        const slug = (matterResult.data as any).slug || file.name.replace(/\.mdx?$/, '');

        return {
          params: {
            slug,
          },
        };
      })
    );

    // Handle duplicate slugs by adding index suffix (same logic as getSortedPostsData)
    const slugMap = new Map<string, number>();
    const processedSlugs = slugs.map(item => {
      const originalSlug = item.params.slug;
      const count = slugMap.get(originalSlug) || 0;
      slugMap.set(originalSlug, count + 1);

      if (count > 0) {
        item.params.slug = `${originalSlug}-${count}`;
        console.warn(`Duplicate slug in getAllPostSlugs: "${originalSlug}" resolved to "${item.params.slug}"`);
      }

      return item;
    });

    return processedSlugs;
  } catch (error) {
    console.error('Error fetching post slugs from GitHub:', error);
    return [];
  }
}

export async function getPostData(slug: string): Promise<PostData> {
  try {
    const files = await githubService.getMarkdownFiles();
    
    // Find file by checking both filename and frontmatter slug
    let file = null;
    for (const f of files) {
      const fileContents = await githubService.getFileContent(f.path);
      const matterResult = matter(fileContents);
      const frontmatterSlug = (matterResult.data as any).slug;
      
      // Check if either the filename or frontmatter slug matches
      if (f.name.replace(/\.mdx?$/, '') === slug || frontmatterSlug === slug) {
        file = f;
        break;
      }
    }
    
    if (!file) {
      throw new Error(`Post with slug "${slug}" not found.`);
    }

    const fileContents = await githubService.getFileContent(file.path);
    const matterResult = matter(fileContents);

    // Use unified, remark-parse, remark-gfm, remark-rehype, rehype-pretty-code, and rehype-stringify to process markdown
    const processedContent = await unified()
      .use(remarkParse) // Parse markdown
      .use(remarkGfm) // Add support for GitHub Flavored Markdown (tables, strikethrough, etc.)
      .use(remarkRehype) // Convert markdown to rehype (HTML AST)
      .use(rehypePrettyCode, { // Apply syntax highlighting
        theme: 'github-dark', // Choose a theme (e.g., github-dark, github-light, one-dark-pro)
        // Optional: keep background color for code blocks
        // keepBackground: true,
      })
      .use(rehypeStringify) // Convert rehype AST to HTML string
      .process(matterResult.content);

    let contentHtml = processedContent.toString();
    
    // Add copy buttons to code blocks
    contentHtml = addCopyButtonsToHtml(contentHtml);
    
    // Enhance tables with status badges (server-side to avoid hydration errors)
    contentHtml = enhanceTablesWithBadges(contentHtml);
    
    // Transform asset references in markdown to use our authenticated API
    contentHtml = transformAssetReferences(contentHtml);

    // Transform the heroImage if it exists
    const transformedData = { ...(matterResult.data as { title: string; date: string; author: string; summary: string; heroImage?: string; }) };
    if (transformedData.heroImage && transformedData.heroImage.startsWith('/assets/')) {
      transformedData.heroImage = transformedData.heroImage.replace('/assets/', '/api/assets/');
    }

    return {
      slug,
      contentHtml,
      ...transformedData,
    };
  } catch (error) {
    console.error(`Error fetching post data for slug "${slug}":`, error);
    throw new Error(`Post with slug "${slug}" not found.`);
  }
}

function transformAssetReferences(html: string): string {
  // Transform markdown image references like ![alt](/assets/image.png) 
  // to use our authenticated asset API endpoint AND add lazy loading
  return html.replace(
    /<img([^>]*?)src="\/assets\/([^"]*?)"([^>]*?)>/g,
    (match, before, assetPath, after) => {
      // Add loading="lazy" and decoding="async" for better performance
      // Only load images as they come into viewport
      const hasLoading = match.includes('loading=');
      const hasDecoding = match.includes('decoding=');
      
      let attrs = before + after;
      if (!hasLoading) attrs += ' loading="lazy"';
      if (!hasDecoding) attrs += ' decoding="async"';
      
      return `<img${attrs}src="/api/assets/${assetPath}">`;
    }
  );
}

function addCopyButtonsToHtml(html: string): string {
  // Find all <pre><code> blocks and add copy buttons
  return html.replace(
    /(<pre[^>]*>)(<code[^>]*>)([\s\S]*?)(<\/code>)(<\/pre>)/g,
    (match, preOpen, codeOpen, codeContent, codeClose, preClose) => {
      // Extract plain text from HTML content (strip all HTML tags and decode entities)
      try {
        // Create a temporary element to parse HTML and extract text content
        // This handles nested tags, entities, and preserves whitespace properly
        let plainText = codeContent
          // First, replace <br> and </div> with newlines to preserve line breaks
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/div>/gi, '\n')
          .replace(/<\/p>/gi, '\n')
          // Remove all HTML tags
          .replace(/<[^>]+>/g, '')
          // Decode HTML entities (common ones first, then numeric)
          .replace(/&nbsp;/g, ' ')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&#x27;/g, "'")
          .replace(/&#x2F;/g, '/')
          // Decode numeric entities
          .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)))
          .replace(/&#x([a-f\d]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
          // Clean up multiple consecutive newlines (max 2)
          .replace(/\n{3,}/g, '\n\n')
          // Trim each line and remove trailing whitespace
          .split('\n')
          .map(line => line.trimEnd())
          .join('\n')
          .trim();
        
        // Encode clean plain text into base64
        const b64 = Buffer.from(plainText, 'utf-8').toString('base64');
        return `
        <div class="code-block-wrapper" style="position: relative;">
          <button 
            class="copy-button absolute top-2 right-2 h-8 w-8 rounded-md bg-zinc-800/80 hover:bg-zinc-800/95 text-zinc-300 hover:text-zinc-100 transition-colors flex items-center justify-center z-10"
            data-code-b64="${b64}"
            title="Copy code"
            aria-label="Copy code"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </button>
          ${preOpen}${codeOpen}${codeContent}${codeClose}${preClose}
        </div>
      `;
      } catch (e) {
        return match;
      }
    }
  );
}

function enhanceTablesWithBadges(html: string): string {
  // Transform tables to add status badges server-side to avoid hydration errors
  return html.replace(
    /<table>([\s\S]*?)<\/table>/g,
    (tableMatch, tableContent) => {
      // Check if this table has a "Status" column
      if (!tableContent.includes('<th>Status</th>')) {
        return tableMatch; // Not a status table, leave it as-is
      }
      
      // Process each row in tbody
      let enhancedTable = tableMatch.replace(
        /<tbody>([\s\S]*?)<\/tbody>/,
        (tbodyMatch, tbodyContent) => {
          // Process each <tr>
          const enhancedRows = tbodyContent.replace(
            /<tr>([\s\S]*?)<\/tr>/g,
            (rowMatch, rowContent) => {
              const cells = rowContent.match(/<td[^>]*>[\s\S]*?<\/td>/g) || [];
              
              if (cells.length >= 2) {
                // Extract test name from first cell
                const testNameCell = cells[0];
                const testNameMatch = testNameCell.match(/<td[^>]*>(.*?)<\/td>/);
                const testName = testNameMatch ? testNameMatch[1].trim() : '';
                
                // Find status cell (second column)
                const statusCell = cells[1];
                const statusMatch = statusCell.match(/<td[^>]*>(.*?)<\/td>/);
                
                if (statusMatch) {
                  const status = statusMatch[1].trim();
                  let badgeHTML = '';
                  
                  // Use Heroicons SVG for professional, consistent iconography
                  switch(status) {
                    case 'Pass':
                      badgeHTML = `<td><span class="inline-flex items-center gap-x-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"><svg class="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" /></svg>Pass</span></td>`;
                      break;
                    case 'Pending':
                      badgeHTML = `<td><span class="inline-flex items-center gap-x-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"><svg class="h-3.5 w-3.5 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Pending</span></td>`;
                      break;
                    case 'Fail':
                      badgeHTML = `<td><span class="inline-flex items-center gap-x-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10"><svg class="h-4 w-4 text-red-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" /></svg>Fail</span></td>`;
                      break;
                    case 'Warning':
                      badgeHTML = `<td><span class="inline-flex items-center gap-x-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/20"><svg class="h-4 w-4 text-orange-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" /></svg>Warning</span></td>`;
                      break;
                    default:
                      badgeHTML = statusCell;
                  }
                  
                  // Replace status cell with badge version
                  cells[1] = badgeHTML;
                  
                  // Add data-test-name attribute to details cell (3rd column) for mobile display
                  if (cells.length >= 3) {
                    // Escape quotes in test name for HTML attribute
                    const escapedTestName = testName.replace(/"/g, '&quot;');
                    cells[2] = cells[2].replace('<td>', `<td class="table-details-cell" data-test-name="${escapedTestName}">`);
                  }
                  
                  return `<tr>${cells.join('')}</tr>`;
                }
              }
              
              return rowMatch;
            }
          );
          
          return `<tbody>${enhancedRows}</tbody>`;
        }
      );
      
      // Wrap the enhanced table in a scrollable wrapper for mobile
      return `<div class="table-scroll-wrapper">${enhancedTable}</div>`;
    }
  );
}