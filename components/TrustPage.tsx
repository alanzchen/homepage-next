import { NextSeo } from "next-seo";

import { FullName, SiteURL } from "../pages/about";

type TrustSection = {
  heading: string;
  paragraphs: string[];
};

type TrustPageProps = {
  content: {
    title: string;
    introduction: string;
    sections: TrustSection[];
  };
  path: "/contact" | "/privacy";
};

export default function TrustPage({ content, path }: TrustPageProps) {
  const title = `${content.title} | ${FullName}`;
  const description = content.introduction;
  const canonical = `${SiteURL}${path}`;

  return (
    <>
      <NextSeo
        title={title}
        description={description}
        canonical={canonical}
        openGraph={{
          title,
          description,
          type: "website",
          url: canonical,
          site_name: FullName,
        }}
      />
      <article className="flex flex-col gap-12">
        <header className="flex flex-col gap-3">
          <h1>{content.title}</h1>
          <p className="text-secondary">{content.introduction}</p>
        </header>
        {content.sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-4">
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-secondary">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </article>
    </>
  );
}
