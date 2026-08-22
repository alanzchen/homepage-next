const test = require("node:test");
const assert = require("node:assert/strict");

const { appendVary, preferredType } = require("../lib/accept");

test("defaults browsers and wildcards to HTML", () => {
  assert.equal(preferredType(null), "text/html");
  assert.equal(preferredType("*/*"), "text/html");
  assert.equal(
    preferredType("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"),
    "text/html"
  );
});

test("selects Markdown when it has the highest preference", () => {
  assert.equal(preferredType("text/markdown"), "text/markdown");
  assert.equal(
    preferredType("text/markdown, text/html;q=0.8, */*;q=0.1"),
    "text/markdown"
  );
});

test("honors q-values, specificity, explicit rejection, and client order", () => {
  assert.equal(
    preferredType("text/markdown;q=0.2, text/html;q=0.9"),
    "text/html"
  );
  assert.equal(
    preferredType("text/html;q=0, */*;q=1"),
    "text/markdown"
  );
  assert.equal(
    preferredType("text/markdown, text/html, */*"),
    "text/markdown"
  );
  assert.equal(preferredType("application/pdf"), null);
  assert.equal(preferredType("text/html;q=0, text/markdown;q=0"), null);
});

test("adds Accept to Vary once", () => {
  assert.equal(appendVary(null, "Accept"), "Accept");
  assert.equal(appendVary("Accept-Encoding", "Accept"), "Accept-Encoding, Accept");
  assert.equal(appendVary("RSC, accept", "Accept"), "RSC, accept");
});
