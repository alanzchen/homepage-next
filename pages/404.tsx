import Link from "components/Link";
import Head from "next/head";
import { FullName } from "./about";

const Custom404 = (): JSX.Element => (
  <>
    <Head>
      <title>404 | { FullName }</title>
      <meta name="robots" content="noindex,follow" />
    </Head>
    <div className="flex flex-col gap-4">
      <h1>404 — Page not found</h1>
      <p className="text-secondary">
        This URL does not exist. It may be an outdated link or a misspelled
        path. The server has returned a real HTTP 404 response.
      </p>
      <h2>Where to look next</h2>
      <ul className="flex flex-col gap-2 text-secondary">
        <li><Link href="/" underline>Homepage</Link> — research, publications, talks, and writing</li>
        <li><Link href="/llms.txt" underline>llms.txt</Link> — agent guidance and curated links</li>
        <li><Link href="/sitemap.xml" underline>Sitemap</Link> — all canonical public pages</li>
        <li><Link href="/contact" underline>Contact</Link> — report a broken link or ask a question</li>
      </ul>
    </div>
  </>
);

export default Custom404;
