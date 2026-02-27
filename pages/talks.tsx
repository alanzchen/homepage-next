import Link from "components/Link";
import Section from "components/Section";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { NextSeo } from "next-seo";
import { FullName, SiteURL } from "./about";
import Award from "../components/Award";
import ConferenceCountBadge from "../components/ConferenceCountBadge";
import { talks, type Talk } from "../data/talks";
import conferenceShortNames from "../data/conferenceShortNames.json";
import Tooltip from "../components/Tooltip";

const seoTitle = `Talks | ${FullName}`;
const seoDesc = `Invited talks and presentations.`;

const pastTalks = talks.filter((talk) => new Date(talk.date) < new Date());
const futureTalks = talks.filter((talk) => new Date(talk.date) > new Date());

interface ConferenceStat {
  conference: string;
  totalTalkCount: number;
  pinned: boolean;
}

function getConferenceStats(allTalks: Talk[]): ConferenceStat[] {
  const conferenceMap = new Map<string, ConferenceStat & { includeInFilter: boolean }>();

  allTalks.forEach((talk) => {
    const currentConference = conferenceMap.get(talk.conference) ?? {
      conference: talk.conference,
      totalTalkCount: 0,
      pinned: false,
      includeInFilter: false
    };

    currentConference.totalTalkCount += 1;
    currentConference.pinned = currentConference.pinned || Boolean(talk.pinned);
    currentConference.includeInFilter = currentConference.includeInFilter || !talk.invited || Boolean(talk.pinned);
    conferenceMap.set(talk.conference, currentConference);
  });

  return [...conferenceMap.values()]
    .filter((conference) => conference.includeInFilter)
    .map(({ conference, totalTalkCount, pinned }) => ({
      conference,
      totalTalkCount,
      pinned
    }))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }

      if (a.totalTalkCount !== b.totalTalkCount) {
        return b.totalTalkCount - a.totalTalkCount;
      }

      return a.conference.localeCompare(b.conference);
    });
}

export function TalkList(talks: Talk[]) {
  return talks
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((talk) => (
      <li key={talk.title + talk.conference + talk.date}>
        <Section heading={talk.date}>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <h3>
                {talk.discussant && <p className="text-secondary">Discussant for</p>}
                {talk.title}
              </h3>
              {talk.award &&
                <p className="text-secondary">
                  <Award award={talk.award} />
                </p>
              }
              <p className="text-secondary">
                {talk.conference}
                {talk.invited && (
                  <Tooltip text="Invited Talk">
                    <span><sup>*</sup></span>
                  </Tooltip>
                )}
              </p>
              <p className="text-secondary">{talk.location}</p>
              {talk.link && <Link href={`${talk.link}`} underline>
                Read More
              </Link>}
            </div>
          </div>
        </Section>
      </li>
    ))
}

const ALL_TALKS = "All Talks";
const INVITED_TALKS = "Invited Talks";
const shortConferenceNames = conferenceShortNames as Record<string, string | null>;

function getConferenceLabel(conference: string, useShortName: boolean) {
  if (conference === ALL_TALKS || conference === INVITED_TALKS) {
    return conference;
  }

  if (!useShortName) {
    return conference;
  }

  const shortName = shortConferenceNames[conference];
  return shortName && shortName.trim().length > 0 ? shortName : conference;
}

export default function Talks() {
  const [selectedConference, setSelectedConference] = useState(ALL_TALKS);
  const [shortNameModeByConference, setShortNameModeByConference] = useState<Record<string, boolean>>({});
  const listboxContainerRef = useRef<HTMLDivElement | null>(null);
  const labelMeasureRef = useRef<HTMLSpanElement | null>(null);
  const conferenceStats = useMemo(() => getConferenceStats(talks), []);
  const conferenceCountByName = useMemo(() => new Map(
    conferenceStats.map((conference) => [conference.conference, conference.totalTalkCount] as const),
  ), [conferenceStats]);
  const conferences = useMemo(() => (
    [ALL_TALKS, INVITED_TALKS, ...conferenceStats.map((conference) => conference.conference)]
  ), [conferenceStats]);

  const totalTalks = talks.length;
  const invitedTalksCount = talks.filter(talk => talk.invited).length;
  const awardsCount = talks.filter(talk => talk.award).length;

  const getCountForFilter = (conference: string) => {
    if (conference === ALL_TALKS) {
      return totalTalks;
    }

    if (conference === INVITED_TALKS) {
      return invitedTalksCount;
    }

    return conferenceCountByName.get(conference);
  };

  const getLabelForConference = (conference: string) => (
    getConferenceLabel(conference, shortNameModeByConference[conference] ?? false)
  );

  const filteredFutureTalks = selectedConference && (selectedConference !== ALL_TALKS)
    ? futureTalks.filter(talk => talk.conference === selectedConference || (selectedConference === INVITED_TALKS && talk.invited))
    : futureTalks;

  const filteredPastTalks = selectedConference && (selectedConference !== ALL_TALKS)
    ? pastTalks.filter(talk => talk.conference === selectedConference || (selectedConference === INVITED_TALKS && talk.invited))
    : pastTalks;

  useEffect(() => {
    const updateConferenceLabelMode = () => {
      const containerElement = listboxContainerRef.current;
      const measureElement = labelMeasureRef.current;
      if (!containerElement || !measureElement) {
        return;
      }

      const containerWidth = containerElement.getBoundingClientRect().width;
      // Keep room for checkmark gutter, count badge, paddings, and dropdown chevron.
      const reservedWidth = 148;
      const availableLabelWidth = Math.max(0, containerWidth - reservedWidth);
      const nextShortNameModeByConference: Record<string, boolean> = {};

      conferences.forEach((conference) => {
        measureElement.textContent = conference;
        const fullLabelWidth = measureElement.getBoundingClientRect().width;
        nextShortNameModeByConference[conference] = fullLabelWidth > availableLabelWidth;
      });

      measureElement.textContent = "";
      setShortNameModeByConference((previousShortNameModeByConference) => {
        const hasChanged = conferences.some((conference) => (
          previousShortNameModeByConference[conference] !== nextShortNameModeByConference[conference]
        ));
        return hasChanged ? nextShortNameModeByConference : previousShortNameModeByConference;
      });
    };

    updateConferenceLabelMode();
    if (document.fonts) {
      document.fonts.ready
        .then(updateConferenceLabelMode)
        .catch(() => undefined);
    }

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(updateConferenceLabelMode);
      if (listboxContainerRef.current) {
        observer.observe(listboxContainerRef.current);
      }
    }

    window.addEventListener("resize", updateConferenceLabelMode);
    return () => {
      if (observer) {
        observer.disconnect();
      }
      window.removeEventListener("resize", updateConferenceLabelMode);
    };
  }, [conferences]);

  return (
    <>
      <NextSeo
        title={seoTitle}
        description={seoDesc}
        openGraph={{
          title: seoTitle,
          url: `${SiteURL}/talks`,
          description: seoDesc,
          site_name: FullName
        }}
        twitter={{
          cardType: "summary_large_image",
        }}
      />
      <div className="flex flex-col gap-10 md:gap-10">
        <div className="">
          <h1>Talks & Discussions</h1>
          <p
            className="text-secondary"
            style={{ "--index": 1 } as React.CSSProperties}
          >
            {totalTalks} Talks • {invitedTalksCount} Invited • {awardsCount} Awards
            <br />
            Invited and discussant talks are marked with *
          </p>
        </div>
        <div
          style={{ zIndex: 5 } as React.CSSProperties}
          className=""
        >
          <Listbox
            value={selectedConference}
            onChange={setSelectedConference}
          >
            <div className="relative" ref={listboxContainerRef}>
              <span
                ref={labelMeasureRef}
                aria-hidden="true"
                className="pointer-events-none absolute invisible whitespace-nowrap text-sm font-normal"
              />
              <Listbox.Button className="p-2 w-full overflow-auto max-h-60 w-42 rounded-xl backdrop-blur-lg ring-1 ring-gray-400 ring-opacity-20 text-sm focus:outline-none hover:bg-secondaryA transition-all">
                <span className="block truncate">
                  {getLabelForConference(selectedConference)}
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronUpDownIcon
                    className="w-5 h-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>
              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Listbox.Options className="absolute mt-2 w-full p-2 overflow-auto text-base origin-top-right shadow-lg max-h-60 w-42 rounded-xl bg-blur backdrop-blur-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm scroll-smooth no-scrollbar">
                  {conferences.map((conference) => {
                    const conferenceCount = getCountForFilter(conference);

                    return (
                      <Listbox.Option
                        key={conference}
                        value={conference}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 rounded-md ${active ? "bg-secondaryA" : "text-primary"
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <div className={`${selected ? "font-medium" : "font-normal"} flex items-center justify-between gap-3`}>
                              <span className="truncate">
                                {getLabelForConference(conference)}
                              </span>
                              {conferenceCount !== undefined && (
                                <ConferenceCountBadge count={conferenceCount} />
                              )}
                            </div>
                            {selected && (
                              <span
                                className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary"
                              >
                                <CheckIcon className="w-5 h-5" aria-hidden="true" />
                              </span>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                    );
                  })}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>
        {filteredFutureTalks.length > 0 && (
          <div
            className="flex flex-col gap-4"
            style={{ "--index": 2 } as React.CSSProperties}
          >
            <h2>Upcoming</h2>
            <ul className="flex flex-col gap-8">
              {TalkList(filteredFutureTalks)}
            </ul>
          </div>
        )}
        {filteredPastTalks.length > 0 && (
          <div
            className="flex flex-col gap-4"
            style={{ "--index": 2 } as React.CSSProperties}
          >
            <h2>Past</h2>
            <ul className="flex flex-col gap-8">
              {TalkList(filteredPastTalks)}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
