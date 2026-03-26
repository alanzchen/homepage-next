import {
  defineDocumentType,
  defineNestedType,
  makeSource,
  ComputedFields,
} from "contentlayer/source-files"; // eslint-disable-line
import rehypeKatex from "rehype-katex";
import rehypePrism from "rehype-prism-plus";
import codeTitle from "remark-code-titles";
import remarkMath from "remark-math";

const getSlug = (doc: any) => doc._raw.sourceFileName.replace(/\.mdx$/, "");

const postComputedFields: ComputedFields = {
  slug: {
    type: "string",
    resolve: (doc) => getSlug(doc),
  }
};

export const Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: `blog/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    summary: { type: "string", required: true },
    publishedAt: { type: "string", required: true },
    updatedAt: { type: "string", required: false },
    tags: { type: "json", required: false },
    image: { type: "string", required: false }
  },
  computedFields: postComputedFields,
}));

const researchComputedFields: ComputedFields = {
  slug: {
    type: "string",
    resolve: (doc) => getSlug(doc),
  },
};

const WorkingResearch = defineNestedType(() => ({
  name: "WorkingResearch",
  fields: {
    title: { type: "string", required: true },
    description: { type: "string", required: true },
    time: { type: "string", required: true },
    url: { type: "string", required: false },
  },
}));

const MediaCoverage = defineNestedType(() => ({
  name: "MediaCoverage",
  fields: {
    name: { type: "string", required: true },
    url: { type: "string", required: true },
  },
}));

const PublicationResearch = defineNestedType(() => ({
  name: "PublicationResearch",
  fields: {
    title: { type: "string", required: true },
    description: { type: "string", required: true },
    publishedAt: { type: "string", required: true },
    journal: { type: "string", required: true },
    authors: { type: "list", of: { type: "string" }, required: true },
    url: { type: "string", required: false },
    forthcoming: { type: "boolean", required: false },
    media_coverage: { type: "list", of: MediaCoverage, required: false },
    abstract: { type: "string", required: false },
  },
}));

export const ResearchItem = defineDocumentType(() => ({
  name: "ResearchItem",
  filePathPattern: `research/**/*.mdx`,
  contentType: "mdx",
  fields: {
    status: {
      type: "enum",
      options: ["working", "published"],
      required: true,
    },
    legacySlugs: { type: "list", of: { type: "string" }, required: false },
    awards: { type: "list", of: { type: "string" }, required: false },
    working: { type: "nested", of: WorkingResearch, required: false },
    publication: { type: "nested", of: PublicationResearch, required: false },
  },
  computedFields: researchComputedFields,
}));

export default makeSource({
  contentDirPath: "data",
  documentTypes: [Post, ResearchItem],
  mdx: {
    rehypePlugins: [rehypePrism, rehypeKatex],
    remarkPlugins: [
      codeTitle, remarkMath
    ],
  },
});
