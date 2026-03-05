# zenan.ch

My personal website/portfolio/blog. Modified from samuelkraft.com.

## Stack

- Next.js
- Typescript
- Tailwind
- Contentlayer/MDX
- Fauna
- Vercel

## CV + Website Single Source

Shared profile/talk metadata lives in:

- `shared/profile.json`
- `shared/talks.json`
- `data/publication/*.mdx` frontmatter

Commands:

- `yarn cv:sync` generates LaTeX includes in `cv/generated/`
- `yarn cv:build` syncs data, compiles `cv/main.tex`, and updates `public/Zenan_Chen_CV.pdf`
- `yarn build:all` compiles CV and then builds the Next.js site

`yarn build` also runs `cv:sync` automatically via `prebuild`.

## CV Release Automation

- GitHub Actions workflow: `.github/workflows/release-cv.yml`
- Trigger: push to `master`/`main` when CV inputs change, or manual dispatch
- Output release asset: `Zenan_Chen_CV.pdf`
- Stable public URL from this site: `/cv`

`/cv` redirects to the fixed `cv-latest` GitHub release asset URL so the website always serves the latest published CV PDF without changing the site link.
