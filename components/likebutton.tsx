import { useEffect, useState } from "react";
import { safeLocalStorage as localStorage } from "lib/localstorage";

import useSWR from "swr";
import fetcher from "lib/fetcher";
import { IconHeart, IconHeartOutline } from "./Icons";
import Halo from "./Halo";
import FlipNumber from "./FlipNumber";

export default function LikeButton({ slug }: { slug: string }) {
  const [mounted, setMounted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(false);
  const endpoint = `/api/likes?slug=${encodeURIComponent(slug)}`;
  const storageKey = `like:v2:${slug}`;
  const { data, error, mutate } = useSWR<{ likes: number }>(endpoint, fetcher);
  const likes = data?.likes;

  useEffect(() => {
    setLiked(localStorage.getItem(storageKey) === "true");
    setMounted(true);
  }, [storageKey]);

  const onLike = async () => {
    if (typeof likes !== "number" || liked || isSubmitting) return;

    const previousData = data;
    setIsSubmitting(true);
    setSubmissionError(false);
    await mutate({ likes: likes + 1 }, false);

    try {
      const response = await fetch(endpoint, { method: "POST" });
      if (!response.ok) {
        throw new Error(`Unable to save like (${response.status})`);
      }

      const updatedData = (await response.json()) as { likes: number };
      localStorage.setItem(storageKey, "true");
      setLiked(true);
      await mutate(updatedData, false);
    } catch {
      setSubmissionError(true);
      await mutate(previousData, false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        disabled={
          liked || isSubmitting || typeof likes !== "number" || Boolean(error)
        }
        onClick={onLike}
        type="button"
        aria-label={liked ? "You liked this post" : "Like this post"}
        className="flex items-center justify-center h-10 gap-2 overflow-hidden text-white transition-transform bg-orange-400 rounded-full like-button hover:cursor-default active:scale-95"
      >
        <Halo
          className="flex items-center justify-center gap-2 px-4"
          size={120}
          strength={30}
        >
          {liked ? <IconHeart /> : <IconHeartOutline />}{" "}
          {typeof likes === "undefined" ? (
            "--"
          ) : (
            <FlipNumber>{likes}</FlipNumber>
          )}
        </Halo>
      </button>
      {error || submissionError ? (
        <p className="text-sm text-secondary" role="status">
          {submissionError
            ? "Couldn’t save your like. Please try again."
            : "Likes are temporarily unavailable."}
        </p>
      ) : null}
    </div>
  );
}
