import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeStringify from 'rehype-stringify';
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

    // Use unified, remark-parse, remark-rehype, rehype-pretty-code, and rehype-stringify to process markdown
    const processedContent = await unified()
      .use(remarkParse) // Parse markdown
      .use(remarkRehype) // Convert markdown to rehype (HTML AST)
      .use(rehypePrettyCode, { // Apply syntax highlighting
        theme: 'github-dark', // Choose a theme (e.g., github-dark, github-light, one-dark-pro)
        // Optional: keep background color for code blocks
        // keepBackground: true,
      })
      .use(rehypeStringify) // Convert rehype AST to HTML string
      .process(matterResult.content);

    let contentHtml = processedContent.toString();
    
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
  // to use our authenticated asset API endpoint
  return html.replace(
    /<img([^>]*?)src="\/assets\/([^"]*?)"([^>]*?)>/g,
    '<img$1src="/api/assets/$2"$3>'
  );
}