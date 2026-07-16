import { Redis } from "@upstash/redis";

let redis: Redis | undefined;

export const getRedis = () => {
  if (!redis) {
    redis = Redis.fromEnv();
  }

  return redis;
};

export const getPostStatsKey = (slug: string) => `post:${slug}`;

export type PostStats = {
  likes?: number;
  views?: number;
};
