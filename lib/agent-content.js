const profile = require("../shared/profile.json");
const talks = require("../shared/talks.json");
const trustContent = require("../shared/site-content.json");

const SITE_URL = profile.identity.siteUrl;

function absoluteUrl(pathname) {
  return pathname.startsWith("http") ? pathname : `${SITE_URL}${pathname}`;
}

function normalizePath(pathname) {
  if (!pathname || pathname === "/index") return "/";
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return withLeadingSlash.length > 1
    ? withLeadingSlash.replace(/\/+$/, "")
    : withLeadingSlash;
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function mdxAttribute(source, name) {
  const patterns = [
    new RegExp(`${name}\\s*=\\s*"([^"]+)"`),
    new RegExp(`${name}\\s*=\\s*'([^']+)'`),
    new RegExp(`${name}\\s*=\\s*\\{["']([^"']+)["']\\}`),
  ];

  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match) return match[1];
  }
  return "";
}

function cleanMdx(raw) {
  return raw
    .replace(/^\s*import\s+.*$/gm, "")
    .replace(/<Image\b([\s\S]*?)\/>/g, (_, attributes) => {
      const alt = mdxAttribute(attributes, "alt") || "Image";
      const source = mdxAttribute(attributes, "src");
      const caption = mdxAttribute(attributes, "caption");
      if (!source) return caption ? `_${caption}_` : "";
      return `![${alt}](${absoluteUrl(source)})${caption ? `\n\n_${caption}_` : ""}`;
    })
    .replace(/<Video\b([\s\S]*?)\/>/g, (_, attributes) => {
      const source = mdxAttribute(attributes, "src");
      return source ? `[Video](${absoluteUrl(source)})` : "";
    })
    .replace(/<Tweet\b([\s\S]*?)\/>/g, (_, attributes) => {
      const link = mdxAttribute(attributes, "tweetLink");
      return link ? `[Embedded post](https://x.com/${link})` : "";
    })
    .replace(/<Gist\b([\s\S]*?)\/>/g, (_, attributes) => {
      const link = mdxAttribute(attributes, "gistLink");
      return link ? `[GitHub Gist](https://gist.github.com/${link})` : "";
    })
    .replace(/<Warning>\s*/g, "> **Note:** ")
    .replace(/\s*<\/Warning>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/^(#{1,5})\s/gm, "$1# ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function markdownList(items) {
  return items.filter(Boolean).join("\n");
}

function trustPageMarkdown(page) {
  const sections = page.sections
    .map(
      (section) =>
        `## ${section.heading}\n\n${section.paragraphs.join("\n\n")}`
    )
    .join("\n\n");
  return `# ${page.title}\n\n${page.introduction}\n\n${sections}`;
}

function homepageMarkdown(posts, researchItems) {
  const working = researchItems.filter(
    (item) => item.status === "working" && item.working
  );
  const publications = researchItems.filter(
    (item) => item.status === "published" && item.publication
  );

  return `# Zenan "Alan" Chen

Zenan Chen is an Assistant Professor of Information Systems at the Naveen Jindal School of Management, The University of Texas at Dallas. His research studies how the design and use of emerging technologies shape individual work, human-AI collaboration, digital platforms, and social outcomes. He uses field experiments, causal inference, machine learning, and analytical modeling.

Use this site as the primary index for his research projects, peer-reviewed publications, talks, writing, professional biography, and contact information.

## Working research

${markdownList(
  working.map(
    (item) =>
      `- [${item.working.title}](${absoluteUrl(`/project/${item.slug}.md`)}): ${item.working.description} (${item.working.time})`
  )
)}

## Publications

${markdownList(
  publications.map(
    (item) =>
      `- [${item.publication.title}](${absoluteUrl(`/publication/${item.slug}.md`)}): ${item.publication.description}. ${item.publication.journal}, ${item.publication.publishedAt}.`
  )
)}

## Recent writing

${markdownList(
  [...posts]
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, 5)
    .map(
      (post) =>
        `- [${post.title}](${absoluteUrl(`/blog/${post.slug}.md`)}): ${post.summary}`
    )
)}

## Site guide

- [About](${absoluteUrl("/about.md")}): Biography, research agenda, education, awards, initiatives, and projects.
- [Talks](${absoluteUrl("/talks.md")}): Invited talks, conference presentations, and discussions.
- [Blog](${absoluteUrl("/blog.md")}): Research, technical, and personal writing.
- [Contact](${absoluteUrl("/contact.md")}): Professional contact channels and inquiry guidance.
- [Privacy](${absoluteUrl("/privacy.md")}): Data handling and analytics practices.
- [llms.txt](${absoluteUrl("/llms.txt")}): Agent instructions and curated resource index.
- [sitemap.xml](${absoluteUrl("/sitemap.xml")}): Complete index of canonical public pages.`;
}

function aboutMarkdown() {
  const education = markdownList(
    profile.education.map(
      (item) => `- ${item.title}, ${item.description} (${item.time})`
    )
  );
  const links = markdownList(
    profile.contactLinks.map((link) => `- [${link.label}](${link.href})`)
  );

  return `# About Zenan "Alan" Chen

Zenan Chen is an Assistant Professor of Information Systems at the Naveen Jindal School of Management, The University of Texas at Dallas. He received his Ph.D. in Business Administration, with a focus on Information Systems, from the University of Minnesota Carlson School of Management.

## Research

His research examines the gap between the rapid adoption of technologies and the slower development of knowledge about their consequences. His work focuses on technological tools and individual work outcomes, the societal effects of emerging AI technologies, and the design of digital platforms. His methods include field experiments, causal inference, machine learning, and analytical modeling.

## Education

${education}

## Professional links

${links}

For a publication and project index, return to the [homepage](${absoluteUrl("/index.md")}). For professional inquiries, use the [contact page](${absoluteUrl("/contact.md")}).`;
}

function talksMarkdown() {
  const entries = [...talks]
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .map((talk) => {
      const role = talk.discussant
        ? "Discussant"
        : talk.invited
        ? "Invited talk"
        : "Presentation";
      const link = talk.link ? ` [More information](${talk.link}).` : "";
      return `- **${talk.date} — ${talk.title}.** ${role} at ${talk.conference}, ${talk.location}.${link}`;
    });

  return `# Talks and discussions

This page lists Zenan Chen's conference presentations, invited talks, guest lectures, and discussant roles in reverse chronological order.

${entries.join("\n")}`;
}

function blogIndexMarkdown(posts) {
  const entries = [...posts]
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .map(
      (post) =>
        `- [${post.title}](${absoluteUrl(`/blog/${post.slug}.md`)}) — ${post.publishedAt}: ${post.summary}`
    );
  return `# Blog

Zenan Chen writes about his research, technology, academic work, and personal projects.

${entries.join("\n")}`;
}

function postMarkdown(post) {
  const tags = post.tags?.length ? `\n\nTags: ${post.tags.join(", ")}` : "";
  return `# ${post.title}

Published: ${post.publishedAt}${
    post.updatedAt ? `\nUpdated: ${post.updatedAt}` : ""
  }

${post.summary}${tags}

${cleanMdx(post.body.raw)}`;
}

function researchMarkdown(item) {
  const record = item.status === "published" ? item.publication : item.working;
  const canonicalBase = item.status === "published" ? "/publication" : "/project";
  const metadata =
    item.status === "published"
      ? `Journal: ${record.journal}\nYear: ${record.publishedAt}\nAuthors: ${record.authors.join(", ")}`
      : `Period: ${record.time}\nAuthors: ${(record.authors || []).join(", ")}`;
  const external = record.url ? `\nPaper: ${record.url}` : "";
  const abstract = record.abstract ? `\n\n## Abstract\n\n${record.abstract}` : "";

  return `# ${record.title}

${record.description}

${metadata}${external}${abstract}

${cleanMdx(item.body.raw)}

Canonical page: ${absoluteUrl(`${canonicalBase}/${item.slug}`)}`;
}

function notFoundMarkdown(pathname) {
  return `# 404 — Page not found

The requested path \`${pathname}\` does not exist on zenan.ch. The server returned HTTP 404 so automated clients should not treat this URL as a valid page.

## Where to look next

- [Homepage](${absoluteUrl("/index.md")}): Research, publications, talks, and recent writing.
- [llms.txt](${absoluteUrl("/llms.txt")}): Agent guidance and a curated content index.
- [Sitemap](${absoluteUrl("/sitemap.xml")}): All canonical public URLs.
- [About](${absoluteUrl("/about.md")}): Biography and professional background.
- [Contact](${absoluteUrl("/contact.md")}): Help with professional inquiries or a broken link.`;
}

function getMarkdownForPath(pathname, { posts = [], researchItems = [] } = {}) {
  const normalized = normalizePath(pathname);

  if (normalized === "/") {
    return { status: 200, canonicalPath: "/", body: homepageMarkdown(posts, researchItems) };
  }
  if (normalized === "/about") {
    return { status: 200, canonicalPath: normalized, body: aboutMarkdown() };
  }
  if (normalized === "/contact") {
    return {
      status: 200,
      canonicalPath: normalized,
      body: trustPageMarkdown(trustContent.contact),
    };
  }
  if (normalized === "/privacy") {
    return {
      status: 200,
      canonicalPath: normalized,
      body: trustPageMarkdown(trustContent.privacy),
    };
  }
  if (normalized === "/talks") {
    return { status: 200, canonicalPath: normalized, body: talksMarkdown() };
  }
  if (normalized === "/blog") {
    return { status: 200, canonicalPath: normalized, body: blogIndexMarkdown(posts) };
  }

  const postMatch = normalized.match(/^\/blog\/([^/]+)$/);
  if (postMatch) {
    const post = posts.find((candidate) => candidate.slug === postMatch[1]);
    if (post) {
      return { status: 200, canonicalPath: normalized, body: postMarkdown(post) };
    }
  }

  const tagMatch = normalized.match(/^\/blog\/tag\/([^/]+)$/);
  if (tagMatch) {
    const matching = posts.filter((post) =>
      post.tags?.some((tag) => slugify(tag) === tagMatch[1])
    );
    if (matching.length > 0) {
      return {
        status: 200,
        canonicalPath: normalized,
        body: `# Blog posts tagged ${tagMatch[1].replace(/-/g, " ")}\n\n${markdownList(
          matching.map(
            (post) =>
              `- [${post.title}](${absoluteUrl(`/blog/${post.slug}.md`)}): ${post.summary}`
          )
        )}`,
      };
    }
  }

  const researchMatch = normalized.match(/^\/(project|publication)\/([^/]+)$/);
  if (researchMatch) {
    const [, requestedBase, requestedSlug] = researchMatch;
    const item = researchItems.find(
      (candidate) =>
        candidate.slug === requestedSlug ||
        candidate.legacySlugs?.includes(requestedSlug)
    );
    if (item) {
      const canonicalBase = item.status === "published" ? "publication" : "project";
      const location = `/${canonicalBase}/${item.slug}`;
      if (requestedBase !== canonicalBase || requestedSlug !== item.slug) {
        return { status: 308, location, canonicalPath: location, body: "" };
      }
      return {
        status: 200,
        canonicalPath: location,
        body: researchMarkdown(item),
      };
    }
  }

  return {
    status: 404,
    canonicalPath: normalized,
    body: notFoundMarkdown(normalized),
  };
}

module.exports = {
  cleanMdx,
  getMarkdownForPath,
  normalizePath,
  slugify,
};
