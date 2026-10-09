import talksData from "../shared/talks.json";
import { allResearchItems } from "../.contentlayer/generated";
import { getResearchItemCanonicalPath } from "../lib/research";

export interface Talk {
  conference: string;
  title: string;
  location: string;
  date: string;
  presenter?: string;
  authors?: string[];
  articlePath?: string;
  link?: string;
  linkLabel?: string;
  award?: string;
  invited?: boolean;
  discussant?: boolean;
  // Keeps this conference at the top of the filter list.
  pinned?: boolean;
}

const authorsByArticle = new Map(allResearchItems.map((item) => [
  getResearchItemCanonicalPath(item),
  (item.status === "published" ? item.publication : item.working)?.authors,
]));

export const talks: Talk[] = talksData.map((talk: Talk) => ({
  ...talk,
  authors: talk.authors ?? (talk.articlePath ? authorsByArticle.get(talk.articlePath) : undefined),
}));
