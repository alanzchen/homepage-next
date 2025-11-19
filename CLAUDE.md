# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal website/portfolio/blog built with Next.js (Pages Router), TypeScript, and Contentlayer for MDX content management. The site features blog posts, research publications, and project showcases with interactive elements like like buttons, hit counters, and webmentions integration.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Type checking
npm run type-check
# or directly: ./node_modules/.bin/tsc

# Clear Contentlayer cache (useful when MDX changes aren't reflecting)
npm run cache-clear
```

## Architecture & Key Concepts

### Content Management with Contentlayer

The site uses Contentlayer to transform MDX files into type-safe data structures. Configuration is in `contentlayer.config.ts`:

- **Posts**: Blog posts in `data/blog/*.mdx`
- **Projects**: Project descriptions in `data/project/*.mdx`
- **Publications**: Research publications in `data/publication/*.mdx`

Each content type has specific frontmatter fields (title, summary, publishedAt, etc.) and is processed through MDX plugins:
- `rehype-prism-plus` for syntax highlighting
- `rehype-katex` for math equations
- `remark-math` for math notation
- `remark-code-titles` for code block titles

Generated types are available at `.contentlayer/generated` (via TypeScript path mapping).

### Pages Router Structure

This uses Next.js Pages Router (not App Router):
- `pages/index.tsx` - Homepage
- `pages/blog/[slug].tsx` - Dynamic blog post pages
- `pages/blog/tag/[slug].tsx` - Tag filtering pages
- `pages/project/[slug].tsx` - Dynamic project pages
- `pages/publication/[slug].tsx` - Dynamic publication pages
- `pages/api/*` - API routes for likes, stats, hit tracking, newsletter subscription

### API Routes & Data Persistence

The site uses **FaunaDB** for persistent data storage:
- `/api/likes` - Handles like counts for blog posts, combined with webmentions
- `/api/stats` - Aggregates post statistics (likes, views, webmentions)
- `/api/register-hit` - Tracks page views
- `/api/subscribe` - Newsletter subscription handling

Environment variable required: `FAUNA_SECRET_KEY` in `.env`

Webmentions are fetched from webmention.io API and combined with FaunaDB likes.

### Theme System

Custom theme system using `next-themes` with three themes:
- `light-theme` (light mode)
- `dark-theme` (dark mode)
- `arc-theme` (custom Arc theme)

Configured in `pages/_app.tsx` with Radix UI colors (Sand palette) and CSS custom properties defined in `styles/globals.css`.

### Build-time Generation

The `next.config.js` webpack configuration triggers build-time scripts on server builds:
- `scripts/generate-sitemap.js` - Creates `public/sitemap.xml`
- `scripts/generate-rss.js` - Generates RSS feed

These run automatically during `npm run build`.

### Styling Approach

- **Tailwind CSS** with custom theme extending Radix UI colors
- Custom CSS properties for theme-aware colors (`--sand1`, `--sand12`, etc.)
- Tailwind config in `tailwind.config.js` uses these CSS vars
- Some components use CSS Modules (`.module.scss` / `.module.css`) for scoped styles

### Component Organization

- `components/` - Shared UI components
- `components/blog/` - Blog-specific components (parallax effects, video embeds, etc.)
- `components/projects/` - Project-specific components
- `components/MDXComponents.tsx` - Custom components available in MDX content

### Custom MDX Components

MDX files can use custom React components defined in `MDXComponents.tsx`. Blog posts commonly use:
- `Tweet` and `Gist` from `mdx-embed`
- Custom Image, Video, and Link components
- KaTeX for math rendering (stylesheet loaded in `_app.tsx`)

## Important Implementation Notes

### Working with MDX Content

When modifying MDX content types in `contentlayer.config.ts`:
1. Update the document type definition
2. Run `npm run cache-clear` to clear Contentlayer cache
3. Restart the dev server

The slug for each content item is automatically computed from the filename (removing `.mdx` extension).

### Adding New Blog Posts

1. Create `data/blog/post-slug.mdx`
2. Add required frontmatter: `title`, `summary`, `publishedAt`
3. Optional: `tags` (JSON array), `image`, `updatedAt`
4. The post will automatically appear in listings and get a route at `/blog/post-slug`

### API Route Patterns

API routes use FaunaDB queries with this pattern:
1. Check if document exists
2. Create if missing
3. Fetch document
4. Update on POST, return on GET

Webmentions are fetched separately and combined with FaunaDB counts.

### Type Safety

TypeScript is configured with strict mode. Generated Contentlayer types are imported from `.contentlayer/generated`. Use these types for any content-related code.

### Analytics & Performance

- Vercel Analytics and Speed Insights are integrated in `_app.tsx`
- Google Analytics tracking via `lib/gtag.ts` with route change listeners
- Hit tracking for all blog posts via `/api/register-hit`

## Site URL Configuration

The canonical site URL is defined in multiple places and should be kept in sync:
- `pages/about.tsx` exports `SiteURL`
- `scripts/generate-sitemap.js` has hardcoded URL
- Used for SEO, OpenGraph tags, and webmentions
