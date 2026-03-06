# AGENTS.md

## Project Overview
This repository hosts `zenan.ch`, a personal website/portfolio/blog built with Next.js (Pages Router), TypeScript, and Contentlayer/MDX. It also contains an academic CV (LaTeX) that is synced from shared data.

## Core Architecture

### Routing
- Uses Next.js **Pages Router** (not App Router).
- Key routes:
  - `pages/index.tsx`
  - `pages/blog/[slug].tsx`
  - `pages/blog/tag/[slug].tsx`
  - `pages/project/[slug].tsx`
  - `pages/publication/[slug].tsx`
  - `pages/api/*`

### Contentlayer and MDX
- Content definitions are in `contentlayer.config.ts`.
- Content sources:
  - Posts: `data/blog/*.mdx`
  - Projects: `data/project/*.mdx`
  - Publications: `data/publication/*.mdx`
- Generated types are from `.contentlayer/generated`.
- MDX processing includes:
  - `rehype-prism-plus`
  - `rehype-katex`
  - `remark-math`
  - `remark-code-titles`

### API and Data
- API routes are under `pages/api/*`.
- Persistent counters/statistics use FaunaDB.
- Required environment variable: `FAUNA_SECRET_KEY`.
- Webmentions are fetched from webmention.io and combined with local stats.

### Styling and Theme
- Tailwind CSS with Radix color variables.
- Theme handling via `next-themes`.
- CSS modules used in selected components.

## CV + Website Single Source Setup

### Source Files
- Profile/about metadata: `shared/profile.json`
- Talks metadata: `shared/talks.json`
- Publication metadata: `data/publication/*.mdx` frontmatter

### CV Generation Pipeline
- Generator script: `scripts/sync-cv.mjs`
- Build script: `scripts/build-cv.mjs`
- Generated TeX files:
  - `cv/generated/profile-sections.tex`
  - `cv/generated/talks.tex`
  - `cv/generated/side-projects.tex`
- Local compiled PDF:
  - `cv/main.pdf`
- Release asset:
  - `Zenan_Chen_CV.pdf` via GitHub releases at `/cv`

Do not manually edit files in `cv/generated/`.

### Talks Rendering Rules (CV)
Implemented in `scripts/sync-cv.mjs`:
- Group by normalized title to avoid duplicate groups from punctuation/spacing typos.
- `Conferences & Workshops` and `Invited Talks` use two-column tabular layout:
  - left column: conference details with date in margin via `\years{...}`
  - right column: right-aligned location
- In invited talks:
  - do not show `(Talk)`
  - show non-talk indicator only (for example, `(Discussant)`)
  - group entries by talk title

## Development Commands

### Primary (yarn)
- `yarn dev`
- `yarn build`
- `yarn start`
- `yarn lint`
- `yarn type-check`
- `yarn cache-clear`
- `yarn cv:sync`
- `yarn cv:build`
- `yarn build:all`

### npm equivalents
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run type-check`
- `npm run cache-clear`

## Build-Time Generation
- During Next.js server builds, scripts generate:
  - `public/sitemap.xml`
  - `public/feed.xml`
- `yarn build` also runs `prebuild` (`cv:sync`) before `next build`.

## Important Workflow Notes
- If you change Contentlayer schema or MDX behavior, run `yarn cache-clear` and restart dev server.
- When updating profile/talk/publication content:
  1. Edit the source files (`shared/*.json` and/or `data/publication/*.mdx`).
  2. Run `yarn cv:sync` (or `yarn cv:build`).
  3. Run `yarn build` if you changed rendering or routing behavior.

## URL Consistency
Canonical URL is referenced in multiple places and should stay consistent:
- `pages/about.tsx` (`SiteURL`)
- SEO/OpenGraph usage across pages
- Sitemap and webmention-related logic
