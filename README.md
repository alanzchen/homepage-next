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
- `data/research/*.mdx` published-item frontmatter

Commands:

- `yarn cv:sync` generates LaTeX includes in `cv/generated/`
- `yarn cv:build` syncs data and compiles `cv/main.tex` into `cv/main.pdf`
- `yarn build:all` compiles CV and then builds the Next.js site

`yarn build` also runs `cv:sync` automatically via `prebuild`.

## CV Release Automation

- GitHub Actions workflow: `.github/workflows/release-cv.yml`
- Trigger: every push to `master`/`main`, or manual dispatch
- Output release asset: `Zenan_Chen_CV.pdf`
- Stable public URL from this site: `/cv`

The workflow uses `xu-cheng/texlive-action` to compile `cv/main.pdf`, renames it to `Zenan_Chen_CV.pdf` for the release asset, and `/cv` redirects to the fixed `cv-latest` GitHub release asset URL so the website always serves the latest published CV PDF without changing the site link.
