import { useMDXComponent } from "next-contentlayer/hooks";
import { allProjects, Project as ProjectType } from ".contentlayer/generated";
import { GetStaticPaths, GetStaticProps } from "next";
import { NextSeo, SiteLinksSearchBoxJsonLd } from "next-seo";
import MDXComponents from "components/MDXComponents";
import { connectLinks, FullName, SiteURL } from "pages/about";
import Link from "components/Link";
import { ReactElement } from "react";
import HitCounter from "components/hitcounter";

type ProjectProps = {
  project: ProjectType;
  rest: ProjectType[];
};

export default function Project({ project, rest }: ProjectProps) {
  const seoTitle = `${project.title} | ${FullName}`;
  const seoDesc = `${project.description}`;
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
            <h1 className="text-2xl font-semibold">{project.title}</h1>
            <div className="flex gap-3">
              <p className="text-secondary">{project.time}</p>
              {project.url && (
                <>
                  <span>&middot;</span>
                  <Link href={project.url}>Read Paper ↗</Link>
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
  return {
    paths: allProjects.map((p) => ({ params: { slug: p.slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const project = allProjects.find((p) => p.slug === params?.slug);
  const rest = allProjects
    /* remove current post */
    .filter((p) => p.slug !== params?.slug);

  return {
    props: {
      project,
      rest,
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
