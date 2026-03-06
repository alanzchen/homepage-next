import talksData from "../shared/talks.json";

export interface Talk {
  conference: string;
  title: string;
  location: string;
  date: string;
  link?: string;
  award?: string;
  invited?: boolean;
  discussant?: boolean;
  // Keeps this conference at the top of the filter list.
  pinned?: boolean;
}

export const talks: Talk[] = talksData;
