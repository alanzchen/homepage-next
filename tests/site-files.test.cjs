const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { buildRoutes, renderSitemap } = require("../scripts/generate-sitemap");

const root = path.join(__dirname, "..");

test("sitemap contains only concrete canonical routes", () => {
  const routes = buildRoutes(root);
  const sitemap = renderSitemap(routes);

  for (const required of ["/", "/about", "/contact", "/privacy", "/talks", "/blog"]) {
    assert.ok(routes.includes(required), `missing ${required}`);
  }
  assert.ok(routes.includes("/blog/isjobs-2-beta"));
  assert.ok(routes.includes("/publication/gen-ai"));
  assert.ok(routes.includes("/project/lost-in-thoughts"));
  assert.doesNotMatch(sitemap, /\}|\[slug\]|\.tsx|\/404/);
});

test("robots.txt names the canonical sitemap", () => {
  const robots = fs.readFileSync(path.join(root, "public", "robots.txt"), "utf8");
  assert.match(robots, /^User-agent: \*/m);
  assert.match(robots, /^Allow: \/$/m);
  assert.match(robots, /^Sitemap: https:\/\/zenan\.ch\/sitemap\.xml$/m);
  assert.doesNotMatch(robots, /samuelkraft/);
});

test("llms.txt follows the v2 outline and contains when-to-use guidance", () => {
  const llms = fs.readFileSync(path.join(root, "public", "llms.txt"), "utf8");
  assert.match(llms, /^# Zenan Chen\n\n> /);
  assert.match(llms, /^## When to use this site$/m);
  assert.match(llms, /Accept: text\/markdown/);
  assert.match(llms, /\.md\)/);

  const h2Sections = llms.split(/^## /m).slice(1);
  for (const section of h2Sections) {
    const lines = section.split("\n").slice(1).filter(Boolean);
    assert.ok(lines.length > 0);
    assert.ok(lines.every((line) => /^- \[[^\]]+\]\(https:\/\//.test(line)));
  }
});

test("contact and privacy source content are substantive", () => {
  const content = JSON.parse(
    fs.readFileSync(path.join(root, "shared", "site-content.json"), "utf8")
  );
  for (const key of ["contact", "privacy"]) {
    const text = [
      content[key].introduction,
      ...content[key].sections.flatMap((section) => section.paragraphs),
    ].join(" ");
    assert.ok(text.length >= 500, `${key} has only ${text.length} characters`);
  }
});
