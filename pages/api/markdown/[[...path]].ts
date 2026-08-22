import type { NextApiRequest, NextApiResponse } from "next";
import { allPosts, allResearchItems } from ".contentlayer/generated";
import { getMarkdownForPath } from "lib/agent-content";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", ["GET", "HEAD"]);
    return res.status(405).end("Method not allowed");
  }

  const pathParts = Array.isArray(req.query.path)
    ? req.query.path
    : req.query.path
    ? [req.query.path]
    : [];
  const pathname = `/${pathParts.join("/")}`;
  const result = getMarkdownForPath(pathname, {
    posts: allPosts,
    researchItems: allResearchItems,
  });

  res.setHeader("Vary", "Accept");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");

  if (result.location) {
    return res.redirect(result.status, result.location);
  }

  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.setHeader("Content-Location", result.canonicalPath);
  res.setHeader(
    "Link",
    `<${result.canonicalPath}>; rel="canonical"; type="text/html", </llms.txt>; rel="describedby"`
  );
  res.status(result.status);

  if (req.method === "HEAD") return res.end();
  return res.send(`${result.body}\n`);
}
