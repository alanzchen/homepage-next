const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const slugify = require("slugify");

const SITE_URL = "https://zenan.ch";
const PROJECT_ROOT = path.join(__dirname, "..");

function filesWithExtension(directory, extension) {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(extension))
    .sort();
}

function buildRoutes(root = PROJECT_ROOT) {
  const routes = new Set([
    "/",
    "/about",
    "/blog",
    "/contact",
    "/privacy",
    "/talks",
  ]);

  const blogDirectory = path.join(root, "data", "blog");
  for (const file of filesWithExtension(blogDirectory, ".mdx")) {
    const slug = file.replace(/\.mdx$/, "");
    const { data } = matter.read(path.join(blogDirectory, file));
    routes.add(`/blog/${slug}`);
    for (const tag of data.tags ?? []) {
      routes.add(`/blog/tag/${slugify(tag, { lower: true })}`);
    }
  }

  const researchDirectory = path.join(root, "data", "research");
  for (const file of filesWithExtension(researchDirectory, ".mdx")) {
    const slug = file.replace(/\.mdx$/, "");
    const { data } = matter.read(path.join(researchDirectory, file));
    const base = data.status === "published" ? "/publication" : "/project";
    routes.add(`${base}/${slug}`);
  }

  return [...routes].sort((a, b) => {
    if (a === "/") return -1;
    if (b === "/") return 1;
    return a.localeCompare(b);
  });
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function renderSitemap(routes) {
  const entries = routes
    .map(
      (route) => `  <url>
    <loc>${escapeXml(`${SITE_URL}${route}`)}</loc>
  </url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

function generateSitemap(root = PROJECT_ROOT) {
  const sitemap = renderSitemap(buildRoutes(root));
  fs.writeFileSync(path.join(root, "public", "sitemap.xml"), sitemap);
  return sitemap;
}

if (require.main === module) {
  generateSitemap();
}

module.exports = { buildRoutes, generateSitemap, renderSitemap };
