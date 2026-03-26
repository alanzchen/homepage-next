const { withContentlayer } = require("next-contentlayer"); // eslint-disable-line
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const getResearchRedirects = () => {
  const researchDir = path.join(__dirname, "data", "research");

  if (!fs.existsSync(researchDir)) {
    return [];
  }

  return fs
    .readdirSync(researchDir)
    .filter((file) => file.endsWith(".mdx"))
    .flatMap((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const { data } = matter.read(path.join(researchDir, file));
      const canonicalBase =
        data.status === "published" ? "/publication" : "/project";
      const alternateBase =
        data.status === "published" ? "/project" : "/publication";
      const redirects = [
        {
          source: `${alternateBase}/${slug}`,
          destination: `${canonicalBase}/${slug}`,
          permanent: true,
        },
      ];

      for (const legacySlug of data.legacySlugs ?? []) {
        redirects.push(
          {
            source: `/project/${legacySlug}`,
            destination: `${canonicalBase}/${slug}`,
            permanent: true,
          },
          {
            source: `/publication/${legacySlug}`,
            destination: `${canonicalBase}/${slug}`,
            permanent: true,
          }
        );
      }

      return redirects;
    });
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dgtzuqphqg23d.cloudfront.net",
      },
      { protocol: "https", hostname: "image.mux.com" },
    ],
  },
  async redirects() {
    return [
      ...getResearchRedirects(),
      {
        source: "/cv",
        destination: "https://go.zenan.ch/cv",
        permanent: false,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      require("./scripts/generate-sitemap");
      require("./scripts/generate-rss");
    }

    // const fileLoaderRule = config.module.rules.find((rule) =>
    //   rule.test?.test?.('.svg'),
    // )

    // config.module.rules.push(
    //   // Reapply the existing rule, but only for svg imports ending in ?url
    //   {
    //     ...fileLoaderRule,
    //     test: /\.svg$/i,
    //     resourceQuery: /url/, // *.svg?url
    //   },
    //   // Convert all other *.svg imports to React components
    //   {
    //     test: /\.svg$/i,
    //     issuer: /\.[jt]sx?$/,
    //     resourceQuery: { not: /url/ }, // exclude if *.svg?url
    //     use: ['@svgr/webpack'],
    //   },
    // )

    return config;
  },
};

module.exports = withContentlayer(nextConfig);
