import { NextRequest, NextResponse } from "next/server";
import { appendVary, preferredType } from "./lib/accept";

const INTERNAL_OR_FILE_PATH = /\/[^/]+\.[^/]+$/;

function canonicalPathForMarkdown(pathname: string) {
  const withoutExtension = pathname.replace(/\.md$/, "");
  return withoutExtension === "/index" ? "/" : withoutExtension;
}

function markdownSibling(pathname: string) {
  if (pathname === "/") return "/index.md";
  return `${pathname.replace(/\/$/, "")}.md`;
}

function addDiscoveryHeaders(response: NextResponse, pathname: string) {
  response.headers.set(
    "Vary",
    appendVary(response.headers.get("Vary"), "Accept")
  );

  const links = [`</llms.txt>; rel="describedby"`];
  if (pathname !== "/cv") {
    links.unshift(
      `<${markdownSibling(pathname)}>; rel="alternate"; type="text/markdown"`
    );
  }
  response.headers.set("Link", links.join(", "));
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.endsWith(".md")) {
    const canonicalPath = canonicalPathForMarkdown(pathname);
    const url = request.nextUrl.clone();
    url.pathname = `/api/markdown${canonicalPath === "/" ? "" : canonicalPath}`;
    url.search = "";
    return NextResponse.rewrite(url);
  }

  // Static files keep their native media types and cache keys.
  if (INTERNAL_OR_FILE_PATH.test(pathname)) {
    return NextResponse.next();
  }

  // Preserve the existing redirect to the externally hosted CV.
  if (pathname === "/cv") {
    return addDiscoveryHeaders(NextResponse.next(), pathname);
  }

  const accept = request.headers.get("accept");
  const chosen = preferredType(accept);

  if (chosen === "text/markdown") {
    const url = request.nextUrl.clone();
    url.pathname = `/api/markdown${pathname === "/" ? "" : pathname}`;
    url.search = "";
    return NextResponse.rewrite(url);
  }

  if (chosen === null && accept) {
    return new Response(
      "Not Acceptable\n\nAvailable: text/html, text/markdown\n",
      {
        status: 406,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          Link: "</llms.txt>; rel=\"describedby\"",
          Vary: "Accept",
        },
      }
    );
  }

  return addDiscoveryHeaders(NextResponse.next(), pathname);
}

export const config = {
  matcher: ["/((?!api/|_next/|_vercel/).*)"],
};
