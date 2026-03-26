import { useMDXComponent } from "next-contentlayer/hooks";
import { allResearchItems, ResearchItem } from ".contentlayer/generated";
import { GetStaticPaths, GetStaticProps } from "next";
import { NextSeo } from "next-seo";
import MDXComponents from "components/MDXComponents";
import { connectLinks, FullName, SiteURL } from "pages/about";
import Link from "components/Link";
import { ReactElement } from "react";
import HitCounter from "components/hitcounter";
import { getResearchItemBySlug } from "../../lib/research";

type ProjectProps = {
  project: ResearchItem;
};

export default function Project({ project }: ProjectProps) {
  const seoTitle = `${project.working?.title} | ${FullName}`;
  const seoDesc = `${project.working?.description}`;
  const url = `${SiteURL}/project/${project.slug}`;
  const Component = useMDXComponent(project.body.code);

  return (
    <>
      <div className="hidden">
        <HitCounter slug={`project-${project.slug}`} />
      </div>
      <NextSeo
        title={seoTitle}
        description={seoDesc}
        canonical={url}
        openGraph={{
          title: seoTitle,
          url,
          description: seoDesc,
          images: [],
        }}
      />

      <div className="flex flex-col gap-20">
        <article>
          <div className="h-20" />
          <div className="flex flex-col gap-3 px-4 md:px-6 py-2 max-w-[700px] mx-auto ">
            <h1 className="text-2xl font-semibold">{project.working?.title}</h1>
            <div className="flex gap-3">
              <p className="text-secondary">{project.working?.time}</p>
              {project.working?.url && (
                <>
                  <span>&middot;</span>
                  <Link href={project.working.url}>Read Paper ↗</Link>
                </>
              )}
            </div>
          </div>

          <div className="h-12" />
          <div className="prose project prose-h2:text-lg prose-h2:mb-2 prose-h2:font-semibold">
            <Component components={MDXComponents} />
          </div>
        </article>
        <hr className="border-primary px-4 md:px-6 py-2 max-w-[700px] mx-auto w-full" />
        <div className="flex flex-col gap-3.5 px-4 md:px-6 py-2 max-w-[700px] mx-auto w-full">
          <h3 className="text-xl">Have any questions?</h3>
          <p className="text-secondary">
            Get in touch with me via{" "}
          </p>
          <ul className="flex gap-5 animated-list">
            {connectLinks.map((link) => (
              <li className="transition-opacity" key={link.label}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
          <div className="h-12"></div>
          <Link href="/" underline>
            ← Back home
          </Link>
        </div>

        <div />
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = allResearchItems
    .filter((item) => item.status === "working")
    .map((item) => ({ params: { slug: item.slug } }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const project = getResearchItemBySlug(allResearchItems, params?.slug);

  if (!project) {
    return {
      notFound: true,
    };
  }

  if (project.status !== "working" || project.slug !== params?.slug) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      project,
    },
  };
};

Project.getLayout = function getLayout(page: ReactElement) {
  return (
    <main className="px-4 md:px-6 pb-24 md:pb-44 max-w-[700px] mx-auto ring-offset-primary">
      {page}
    </main>
  )
};
