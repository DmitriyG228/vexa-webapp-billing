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
    
    const allPostsData = await Promise.all(
      files.map(async (file) => {
        const fileContents = await githubService.getFileContent(file.path);
        const matterResult = matter(fileContents);

        // Use slug from frontmatter if available, otherwise use filename
        const slug = (matterResult.data as any).slug || file.name.replace(/\.mdx?$/, '');
        
        // Debug: Log the parsed frontmatter
        console.log(`Parsed frontmatter for ${slug}:`, matterResult.data);

        return {
          slug,
          ...(matterResult.data as { title: string; date: string; author: string; summary: string; }),
        };
      })
    );

    // Sort posts by date
    return allPostsData.sort((a, b) => {
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
    
    return slugs;
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

    const contentHtml = processedContent.toString();

    return {
      slug,
      contentHtml,
      ...(matterResult.data as { title: string; date: string; author: string; summary: string; }),
    };
  } catch (error) {
    console.error(`Error fetching post data for slug "${slug}":`, error);
    throw new Error(`Post with slug "${slug}" not found.`);
  }
} 