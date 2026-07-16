import { NextApiRequest, NextApiResponse } from "next";
import { getPostStatsKey, getRedis } from "lib/redis";

type Data = {
  message?: string;
  hits?: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const slug = Array.isArray(req.query.slug) ? undefined : req.query.slug;
  if (!slug || !/^[a-z0-9][a-z0-9-]*$/i.test(slug)) {
    return res.status(400).json({
      message: "Valid content slug not provided",
    });
  }

  res.setHeader("Cache-Control", "private, no-store");

  try {
    const hits = await getRedis().hincrby(
      getPostStatsKey(slug),
      "views",
      1
    );
    return res.status(200).json({ hits });
  } catch (error) {
    console.error("Failed to register content view", { slug, error });
    return res.status(500).json({ message: "Unable to register view" });
  }
}
