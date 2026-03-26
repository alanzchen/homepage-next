import Image from "next/image";
import { NextSeo } from "next-seo";

import Link from "components/Link";
import Section from "components/Section";
import Workplaces from "components/Workplaces";
import Gallery from "components/Gallery";
import { ActivityType } from "components/Activity";

import cuhkLogo from "public/schools/CUHK.png";
import umnLogo from "public/schools/UMN.png";

import jupyterLogo from "public/projects/jupyter.png";
import qianjianLogo from "public/ventures/qianjian.png";
import stayLogo from "public/ventures/stay.jpeg";
import openaiLogo from "public/projects/openai-logo.png";
import nosediveLogo from "public/projects/nosedive.png";
import canvasLogo from "public/projects/canvas.png";
import isjobsLogo from "public/ventures/davis001.jpg";
import surgeLogo from "public/ventures/surge.svg";
import misqLogo from "public/ventures/misq.png";

import avatar from "public/avatar.png";
import profileData from "shared/profile.json";

import { GetStaticProps } from "next";
import { getActivities } from "../lib/strava";

const schoolImageMap = {
  UMN: umnLogo,
  CUHK: cuhkLogo,
} as const;

const projectImageMap = {
  OPENAI: openaiLogo,
  CANVAS: canvasLogo,
  JUPYTER: jupyterLogo,
  NOSEDIVE: nosediveLogo,
  ISJOBS: isjobsLogo,
  MISQ: misqLogo,
  SURGE: surgeLogo,
  QIANJIAN: qianjianLogo,
  STAY: stayLogo,
} as const;

export const connectLinks = profileData.contactLinks;
export const FullName = profileData.identity.fullName;
export const SiteURL = profileData.identity.siteUrl;

const education = profileData.education.map((item) => ({
  title: item.title,
  description: item.description,
  time: item.time,
  imageSrc: schoolImageMap[item.imageKey as keyof typeof schoolImageMap],
}));

const sideProjects = profileData.sideProjects.map((item) => ({
  title: item.title,
  time: item.time,
  description: item.description,
  imageSrc: projectImageMap[item.imageKey as keyof typeof projectImageMap],
  link: item.link,
}));

const ventures = profileData.ventures.map((item) => ({
  title: item.title,
  time: item.time,
  description: item.description,
  imageSrc: projectImageMap[item.imageKey as keyof typeof projectImageMap],
  link: item.link,
}));

const awards = profileData.awards.filter((award) => award.featuredOnWebsite);

const seoTitle = `About | ${FullName}`;
export const seoDesc =
  profileData.identity.seoDescription;

export default function About({ activities }: { activities: ActivityType[] }) {
  return (
    <>
      <NextSeo
        title={seoTitle}
        description={seoDesc}
        openGraph={{
          title: seoTitle,
          description: seoDesc,
          url: `/about/`,
          site_name: `${FullName}`,
        }}
        twitter={{
          cardType: "summary_large_image",
        }}
      />
      <div className="flex flex-col gap-16 md:gap-24">
        <div className="hidden sm:block">
          <Gallery activities={activities}/>
        </div>
        <div className="-mb-8 sm:hidden animate-in">
          <Image
            src={avatar}
            width={48}
            height={48}
            alt={`avatar of ${FullName}`}
          />
        </div>
        <div
          className="flex flex-col gap-16 animate-in sm:animate-none md:gap-16"
          style={{ "--index": 2 } as React.CSSProperties}
        >
          <Section heading="About me" headingAlignment="right">
            <div className="flex flex-col gap-6">
              <p>
                <em className="font-semibold">Hi!</em>&nbsp; My name is Zenan (泽南) Chen (陈), I usually go by Alan. I am an assistant professor at University of Texas at Dallas, Jindal School of Management. I received my Ph.D. in Business Administration (Information Systems) from University of Minnesota, Carlson School of Management.
              </p>
            </div>
          </Section>
          <Section heading="Research" headingAlignment="right">
            <div className="flex flex-col gap-6">
              <p>
                Driven by the mistmatch between our understanding of technologies and the rate at which they are adopted, my research vision is centered on understanding and guiding the design and usage of emerging technologies and platforms. More specifically, I am interested in the following areas:
              </p>
              <ul className="list-decimal ml-10">
                <li>the impact of technological tools on individual work outcomes,</li>
                <li>the societal effects of emerging AI technologies, and</li>
                <li>the design considerations of digital platforms.</li>
              </ul>
              <p>
                I use a blend of methods, including field experiments, casual inference, machine learning, and analytical modeling.
              </p>
            </div>
          </Section>
          <Section heading="Connect" headingAlignment="right">
            <ul className="flex gap-6 animated-list">
              {connectLinks.map((link) => (
                <li className="transition-opacity" key={link.label}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </Section>
          <Section heading="Education" headingAlignment="right">
            <div className="flex flex-col w-full gap-8">
              <p>
                Dissertation: <i>Design Considerations of Information Systems Artifacts and Digital Platforms</i><br />
              </p>
              <Workplaces items={education} />
            </div>
          </Section>
          <Section heading="Selected Awards" headingAlignment="right">
            <div className="flex flex-col w-full gap-8">
              <ul className={`flex flex-col gap-1`}>
                {awards.map((award) => (
                  <li className="" key={`${award.title}-${award.time}`}>
                    <div className="flex justify-between gap-2">
                      <div className="flex flex-col gap-px">
                        <p>{award.title}</p>
                        {award.description && <p className="text-sm text-secondary">{award.description}</p>}
                      </div>
                      <p className="text-secondary">{award.time}</p>
                    </div>
                </li>
                ))}
              </ul>
            </div>
          </Section>
          <Section heading="Initiatives" headingAlignment="right">
            <div className="flex flex-col w-full gap-8">
              <p>Initiatives I have founded, co-founded, or advised. </p>
              <Workplaces items={ventures} isAnimated />
            </div>
          </Section>
          <Section heading="Side Projects" headingAlignment="right">
            <div className="flex flex-col w-full gap-8">
              <p>I am also a self-taught full-stack developer. I build stuff for fun :) </p>
              <Workplaces items={sideProjects} isAnimated />
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  let activities: ActivityType[] = [];
  try {
    activities = await getActivities();
  } catch (error) {
    console.log(error);
  }

  return {
    props: {
      activities: activities
    },
    revalidate: 3600,
  };
};
