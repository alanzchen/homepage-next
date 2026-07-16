import { Redis } from "@upstash/redis";

const displayedLikeBaselines = [
  {
    slug: "gpt-on-mac",
    likes: 40,
    source: "Wayback API capture from 2024-09-19",
  },
  {
    slug: "nft",
    likes: 3,
    source: "Wayback API capture from 2024-09-19",
  },
  {
    slug: "ts-ticket-market",
    likes: 4,
    source: "Wayback API capture from 2024-09-19",
  },
  {
    slug: "is-job-market",
    likes: 0,
    source: "No archived API count found",
  },
  {
    slug: "isjobs-2-beta",
    likes: 0,
    source: "Published after Fauna service ended",
  },
];

const redisUrl =
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken =
  process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

if (!redisUrl || !redisToken) {
  if (process.argv.includes("--if-configured")) {
    console.log("Redis credentials not configured; skipping baseline seed");
    process.exit(0);
  }

  throw new Error(
    "Redis URL and write token are required via UPSTASH_REDIS_REST_* or KV_REST_API_*"
  );
}

const redis = new Redis({ url: redisUrl, token: redisToken });

for (const { slug, likes, source } of displayedLikeBaselines) {
  const key = `post:${slug}`;
  const inserted = await redis.hsetnx(key, "likes", likes);
  const currentLikes = await redis.hget(key, "likes");
  const action = inserted ? "seeded" : "kept existing";

  console.log(`${slug}: ${action} total ${currentLikes} (${source})`);
}
