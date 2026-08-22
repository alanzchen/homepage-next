import assert from "node:assert/strict";

const baseUrl = (process.env.BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

function headerHas(response, name, token) {
  return (response.headers.get(name) || "")
    .toLowerCase()
    .split(",")
    .map((part) => part.trim())
    .some((part) => part.includes(token.toLowerCase()));
}

function visibleText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:[a-z]+|#\d+|#x[0-9a-f]+);/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function request(pathname, options = {}) {
  return fetch(`${baseUrl}${pathname}`, { redirect: "manual", ...options });
}

const homepage = await request("/", { headers: { Accept: "text/html" } });
assert.equal(homepage.status, 200);
assert.match(homepage.headers.get("content-type") || "", /^text\/html/);
assert.ok(headerHas(homepage, "vary", "accept"));
assert.match(homepage.headers.get("link") || "", /rel="alternate"; type="text\/markdown"/);
assert.match(homepage.headers.get("link") || "", /rel="describedby"/);

const homeHtml = await homepage.text();
const homeText = visibleText(homeHtml);
assert.match(homeHtml, /<html[^>]+lang="en"/i);
assert.match(homeHtml, /<h1[^>]*>[^<]*Zenan/i);
assert.ok(homeText.length >= 500, `homepage has ${homeText.length} visible characters`);
assert.ok(
  homeText.length / Buffer.byteLength(homeHtml) >= 0.05,
  `homepage content efficiency is ${(
    (homeText.length / Buffer.byteLength(homeHtml)) *
    100
  ).toFixed(2)}%`
);
assert.match(homeHtml, /<link rel="canonical" href="https:\/\/zenan\.ch"/i);
assert.match(homeHtml, /<meta property="og:image"/i);
assert.match(homeHtml, /<meta property="og:type" content="website"/i);

const jsonLdMatch = homeHtml.match(
  /<script id="home-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/i
);
assert.ok(jsonLdMatch, "homepage JSON-LD is missing");
const jsonLd = JSON.parse(jsonLdMatch[1]);
const graph = jsonLd["@graph"];
const person = graph.find((entry) => entry["@type"] === "Person");
const organization = graph.find((entry) => entry["@type"] === "Organization");
assert.ok(person?.name && person?.description && person?.url && person?.sameAs?.length);
assert.ok(organization?.name && organization?.description && organization?.url);
assert.ok(organization?.contactPoint?.contactType);
assert.ok(organization?.contactPoint?.email);
assert.ok(organization?.contactPoint?.telephone);
assert.equal(organization?.address?.["@type"], "PostalAddress");

const markdown = await request("/", { headers: { Accept: "text/markdown" } });
assert.equal(markdown.status, 200);
assert.match(markdown.headers.get("content-type") || "", /^text\/markdown; charset=utf-8/i);
assert.ok(headerHas(markdown, "vary", "accept"));
assert.match(await markdown.text(), /^# Zenan "Alan" Chen/);

const sibling = await request("/index.md");
assert.equal(sibling.status, 200);
assert.match(sibling.headers.get("content-type") || "", /^text\/markdown/);

const unacceptable = await request("/", { headers: { Accept: "application/pdf" } });
assert.equal(unacceptable.status, 406);
assert.ok(headerHas(unacceptable, "vary", "accept"));

for (const [pathname, minimum] of [["/about", 500], ["/contact", 500], ["/privacy", 500]]) {
  const response = await request(pathname, { headers: { Accept: "text/html" } });
  assert.equal(response.status, 200, pathname);
  const html = await response.text();
  const length = visibleText(html).length;
  assert.ok(length >= minimum, `${pathname} has ${length} visible characters`);
  assert.match(html, /<h1[ >]/i, `${pathname} is missing an H1`);
  assert.match(html, new RegExp(`<link rel="canonical" href="https:\\/\\/zenan\\.ch${pathname}"`, "i"));
}

for (const accept of ["text/html", "text/markdown"]) {
  const response = await request("/some-path-that-does-not-exist-agent-test", {
    headers: { Accept: accept },
  });
  assert.equal(response.status, 404, `404 status for ${accept}`);
  const body = await response.text();
  assert.match(body, /llms\.txt/i);
  assert.match(body, /sitemap/i);
}

const machineFiles = [
  ["/robots.txt", /^text\/plain/],
  ["/llms.txt", /^text\/plain/],
  ["/sitemap.xml", /xml/],
  ["/feed.xml", /xml/],
  ["/laurel.svg", /image\/svg\+xml/],
];
for (const [pathname, contentType] of machineFiles) {
  const response = await request(pathname);
  assert.equal(response.status, 200, pathname);
  assert.match(response.headers.get("content-type") || "", contentType, pathname);
}

const robots = await (await request("/robots.txt")).text();
assert.match(robots, /Sitemap: https:\/\/zenan\.ch\/sitemap\.xml/);
const llms = await (await request("/llms.txt")).text();
assert.match(llms, /^# Zenan Chen/);
assert.match(llms, /^## When to use this site$/m);

const sitemap = await (await request("/sitemap.xml")).text();
assert.doesNotMatch(sitemap, /\}|\[slug\]|\.tsx/);
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
assert.ok(urls.length >= 10, `sitemap has only ${urls.length} URLs`);

for (const url of urls) {
  const parsed = new URL(url);
  assert.equal(parsed.origin, "https://zenan.ch");

  const htmlResponse = await request(parsed.pathname, {
    headers: { Accept: "text/html" },
  });
  assert.equal(htmlResponse.status, 200, `${parsed.pathname} HTML`);
  assert.ok(headerHas(htmlResponse, "vary", "accept"));

  const markdownResponse = await request(parsed.pathname, {
    headers: { Accept: "text/markdown" },
  });
  assert.equal(markdownResponse.status, 200, `${parsed.pathname} Markdown`);
  assert.match(markdownResponse.headers.get("content-type") || "", /^text\/markdown/);
  assert.ok(headerHas(markdownResponse, "vary", "accept"));
  assert.match(await markdownResponse.text(), /^# /);
}

console.log(
  `Verified ${urls.length} canonical routes in HTML and Markdown plus all machine-readable files at ${baseUrl}`
);
