const test = require("node:test");
const assert = require("node:assert/strict");

const { cleanMdx, getMarkdownForPath } = require("../lib/agent-content");

const posts = [
  {
    slug: "example",
    title: "Example post",
    summary: "A useful example article.",
    publishedAt: "2026-01-01",
    tags: ["Human AI"],
    body: {
      raw: 'import Thing from "thing"\n\n# Section\n\n<Image alt="Chart" src={\'/chart.png\'} caption="Results" />',
    },
  },
];

const researchItems = [
  {
    slug: "working-paper",
    status: "working",
    legacySlugs: ["old-paper"],
    working: {
      title: "Working paper",
      description: "Research in progress.",
      time: "2026 - Present",
      authors: ["Zenan Chen"],
      url: "https://example.com/paper",
    },
    body: { raw: "# Abstract\n\nStudy details." },
  },
];

test("homepage Markdown is substantive and points to recovery resources", () => {
  const result = getMarkdownForPath("/", { posts, researchItems });
  assert.equal(result.status, 200);
  assert.match(result.body, /^# Zenan "Alan" Chen/);
  assert.ok(result.body.length > 500);
  assert.match(result.body, /llms\.txt/);
  assert.match(result.body, /sitemap\.xml/);
});

test("MDX is converted to clean, hierarchy-safe Markdown", () => {
  const cleaned = cleanMdx(posts[0].body.raw);
  assert.doesNotMatch(cleaned, /import Thing|<Image/);
  assert.match(cleaned, /^## Section/m);
  assert.match(cleaned, /!\[Chart\]\(https:\/\/zenan\.ch\/chart\.png\)/);
  assert.match(cleaned, /_Results_/);
});

test("known pages, tags, and legacy research redirects resolve", () => {
  assert.equal(getMarkdownForPath("/contact", { posts, researchItems }).status, 200);
  assert.equal(
    getMarkdownForPath("/blog/tag/human-ai", { posts, researchItems }).status,
    200
  );
  assert.deepEqual(
    getMarkdownForPath("/publication/old-paper", { posts, researchItems }),
    {
      status: 308,
      location: "/project/working-paper",
      canonicalPath: "/project/working-paper",
      body: "",
    }
  );
});

test("unknown paths return a real Markdown 404 with recovery links", () => {
  const result = getMarkdownForPath("/missing", { posts, researchItems });
  assert.equal(result.status, 404);
  assert.match(result.body, /^# 404/);
  assert.match(result.body, /Homepage/);
  assert.match(result.body, /llms\.txt/);
  assert.match(result.body, /Sitemap/);
});
