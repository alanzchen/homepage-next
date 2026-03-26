import { ResearchItem } from "../.contentlayer/generated";

export const getResearchItemBySlug = (
  items: ResearchItem[],
  slug?: string | string[]
) => {
  if (typeof slug !== "string") {
    return undefined;
  }

  return items.find(
    (item) => item.slug === slug || item.legacySlugs?.includes(slug)
  );
};

export const getResearchItemCanonicalPath = (item: ResearchItem) => {
  return item.status === "published"
    ? `/publication/${item.slug}`
    : `/project/${item.slug}`;
};

export const getResearchItemRoute = (item: ResearchItem) => {
  return item.status === "published" ? "publication" : "project";
};

export const getResearchItemSortYear = (value: string) => {
  return parseInt(value.slice(0, 4), 10);
};
