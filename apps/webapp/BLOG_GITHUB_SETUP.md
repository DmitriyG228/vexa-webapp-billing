# Blog GitHub Integration Setup

This guide explains how to set up the blog system to fetch content from the private GitHub repository `git@github.com:Vexa-ai/blog_articles.git`.

## Prerequisites

1. Access to the `Vexa-ai/blog_articles` repository
2. GitHub Personal Access Token (PAT) with appropriate permissions

## Setup Steps

### 1. Generate GitHub Personal Access Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Blog Content Access")
4. Set expiration as needed
5. Select these scopes:
   - `repo` (Full control of private repositories)
   - `read:org` (if the repo is in an organization)
6. Click "Generate token"
7. **Copy the token immediately** - you won't see it again!

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
# Copy the example file
cp .env.example .env

# Edit the file with your actual values
nano .env
```

Required variables:
```bash
GITHUB_TOKEN=ghp_your_actual_token_here
GITHUB_REPO_PATH=blog
NEXT_REVALIDATE_SECONDS=3600
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Optional variables:
```bash
GITHUB_WEBHOOK_SECRET=your_random_secret_here
```

### 3. Repository Structure

Ensure your `blog_articles` repository has this structure:

```
blog_articles/
└── blog/
    ├── post-1.md
    ├── post-2.md
    └── post-3.mdx
```

Each markdown file should have frontmatter like:

```yaml
---
title: 'Your Post Title'
date: '2025-01-15'
author: 'Author Name'
authorImage: 'https://example.com/author.jpg'
authorLinkedIn: 'https://linkedin.com/in/author'
heroImage: '/images/blog/hero-image.png'
summary: 'Brief description of the post'
---
```

### 4. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `/blog` to see if posts are loaded from GitHub

3. Check the console for any error messages

### 5. Set Up Webhook (Optional)

For real-time updates when content changes:

1. Go to your `blog_articles` repository on GitHub
2. Click Settings → Webhooks → Add webhook
3. Configure:
   - **Payload URL**: `https://yourdomain.com/api/github-webhook`
   - **Content type**: `application/json`
   - **Secret**: Use the same value as `GITHUB_WEBHOOK_SECRET`
   - **Events**: Select "Just the push event"
4. Click "Add webhook"

## Troubleshooting

### Common Issues

1. **"GitHub API error: 401"**
   - Check your `GITHUB_TOKEN` is correct
   - Ensure the token has the right permissions
   - Verify the token hasn't expired

2. **"GitHub API error: 404"**
   - Check the repository name and owner
   - Verify the `GITHUB_REPO_PATH` is correct
   - Ensure the repository exists and is accessible

3. **Posts not loading**
   - Check browser console for errors
   - Verify markdown files exist in the specified path
   - Check that files have valid frontmatter

### Debug Mode

Add this to your `.env` for more detailed logging:

```bash
DEBUG=github:*
```

## Performance Considerations

- **Caching**: Content is cached for 1 hour by default (configurable via `NEXT_REVALIDATE_SECONDS`)
- **Webhooks**: Enable real-time updates when content changes
- **Static Generation**: Pages are statically generated for optimal performance

## Security Notes

- Never commit your `.env` file to version control
- Use environment variables in production deployments
- The webhook endpoint validates GitHub signatures when `GITHUB_WEBHOOK_SECRET` is set
- Consider using GitHub Apps instead of Personal Access Tokens for production

## Production Deployment

When deploying to production:

1. Set environment variables in your hosting platform
2. Update `NEXT_PUBLIC_APP_URL` to your production domain
3. Configure the webhook URL to point to your production domain
4. Consider using GitHub Apps for better security and rate limiting
