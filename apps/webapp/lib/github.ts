export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  download_url: string;
  content?: string;
}

export class GitHubContentService {
  private readonly token: string;
  private readonly owner: string;
  private readonly repo: string;
  private readonly basePath: string;
  private readonly baseUrl = 'https://api.github.com';

  constructor() {
    this.token = process.env.GITHUB_TOKEN!;
    this.owner = 'Vexa-ai';
    this.repo = 'blog_articles';
    // Handle empty path for root directory
    this.basePath = process.env.GITHUB_REPO_PATH === '' ? '' : (process.env.GITHUB_REPO_PATH || 'blog');
  }

  private get headers() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
  }

  async getDirectoryContents(path: string = this.basePath): Promise<GitHubFile[]> {
    // Handle empty path for root directory
    const pathSegment = path === '' ? '' : `/${path}`;
    const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents${pathSegment}`;
    
    // Debug logging
    console.log('GitHub API Debug:', {
      owner: this.owner,
      repo: this.repo,
      basePath: this.basePath,
      path,
      pathSegment,
      url,
      hasToken: !!this.token
    });
    
    const response = await fetch(url, {
      headers: this.headers,
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      console.error('GitHub API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('GitHub API Success Response:', {
      dataType: Array.isArray(data) ? 'array' : 'object',
      dataLength: Array.isArray(data) ? data.length : 1
    });
    
    return Array.isArray(data) ? data : [data];
  }

  async getFileContent(path: string): Promise<string> {
    const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`;
    
    const response = await fetch(url, {
      headers: this.headers,
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.content) {
      // Content is base64 encoded
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    
    throw new Error('File content not found');
  }

  async getMarkdownFiles(): Promise<GitHubFile[]> {
    const files = await this.getDirectoryContents();
    return files.filter(file => 
      file.name.endsWith('.md') || file.name.endsWith('.mdx')
    );
  }

  async getAssetUrl(assetPath: string): Promise<string> {
    // For authenticated access, construct the raw URL with the token
    const rawUrl = `https://raw.githubusercontent.com/${this.owner}/${this.repo}/main/${assetPath}`;
    return rawUrl;
  }

  async getAssetContent(assetPath: string): Promise<ArrayBuffer> {
    const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${assetPath}`;
    
    const response = await fetch(url, {
      headers: this.headers,
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch asset: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.content) {
      // Content is base64 encoded
      return Buffer.from(data.content, 'base64').buffer;
    }
    
    throw new Error('Asset content not found');
  }

  async listAssets(): Promise<GitHubFile[]> {
    try {
      const files = await this.getDirectoryContents('assets');
      return files;
    } catch (error) {
      console.warn('Assets directory not found or empty:', error);
      return [];
    }
  }
}
