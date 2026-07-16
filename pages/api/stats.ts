import type { NextApiRequest, NextApiResponse } from "next";
import { pick } from "lib/pick";
import { getPostStatsKey, getRedis, PostStats } from "lib/redis";
import { allPosts } from ".contentlayer/generated";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const posts = allPosts.map((post) =>
    pick(post, ["slug", "title", "publishedAt", "image", "tags", "summary"])
  );
  try {
    const redis = getRedis();
    const postsWithLikes = await Promise.all(
      posts
        .sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
        )
        .map(async (post) => {
          const stats = await redis.hgetall<PostStats>(
            getPostStatsKey(post.slug)
          );

          return {
            ...post,
            id: post.slug,
            likes: stats?.likes ?? 0,
            views: stats?.views ?? 0,
          };
        })
    );

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
    return res.status(200).json({ posts: postsWithLikes });
  } catch (error) {
    console.error("Failed to load post stats", { error });
    return res.status(500).json({ message: "Unable to load post stats" });
  }
}
