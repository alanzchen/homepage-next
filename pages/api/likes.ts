import { NextApiRequest, NextApiResponse } from "next";
import { getPostStatsKey, getRedis } from "lib/redis";

type Data = {
  message?: string;
  likes?: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const slug = Array.isArray(req.query.slug) ? undefined : req.query.slug;
  if (!slug || !/^[a-z0-9][a-z0-9-]*$/i.test(slug)) {
    return res.status(400).json({
      message: "Valid article slug not provided",
    });
  }

  res.setHeader("Cache-Control", "private, no-store");

  try {
    const redis = getRedis();
    const storedLikes =
      req.method === "POST"
        ? await redis.hincrby(getPostStatsKey(slug), "likes", 1)
        : (await redis.hget<number>(getPostStatsKey(slug), "likes")) ?? 0;

    return res.status(200).json({ likes: storedLikes });
  } catch (error) {
    console.error("Failed to read or update likes", { slug, error });
    return res.status(500).json({ message: "Unable to load likes" });
  }
}
