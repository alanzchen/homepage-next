import { useEffect, useState } from "react";

const HitCounter = ({ slug }: { slug: string }): JSX.Element => {
  const [hits, setHits] = useState(undefined);

  useEffect(() => {
    // Don't count hits on localhost
    if (process.env.NODE_ENV !== "production") {
      return;
    }
    const controller = new AbortController();

    // Invoke the function by making a request.
    // Update the URL to match the format of your platform.
    fetch(`/api/register-hit?slug=${encodeURIComponent(slug)}`, {
      method: "POST",
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Unable to register view (${res.status})`);
        }
        return res.json();
      })
      .then((json) => {
        if (typeof json.hits === "number") {
          setHits(json.hits);
        }
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, [slug]);

  if (typeof hits === "undefined") {
    return <></>;
  }

  return (
    <>
      <span> &middot;</span> {hits} Views
    </>
  );
};

export default HitCounter;
