import Head from "next/head";

import profileData from "shared/profile.json";

const { identity, contactLinks, cvHeader } = profileData;
const personId = `${identity.siteUrl}/#person`;
const organizationId = `${identity.siteUrl}/#organization`;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfilePage",
      "@id": `${identity.siteUrl}/#profile-page`,
      url: identity.siteUrl,
      name: `${identity.fullName} — academic profile`,
      description: identity.seoDescription,
      mainEntity: { "@id": personId },
    },
    {
      "@type": "Person",
      "@id": personId,
      name: identity.fullName,
      alternateName: "Zenan Alan Chen",
      description: identity.seoDescription,
      url: identity.siteUrl,
      image: `${identity.siteUrl}/headshot.jpeg`,
      jobTitle: "Assistant Professor of Information Systems",
      email: `mailto:${cvHeader.emails[0]}`,
      telephone: cvHeader.telephone,
      worksFor: { "@id": organizationId },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "University of Minnesota",
        url: "https://twin-cities.umn.edu/",
      },
      knowsAbout: [
        "Information Systems",
        "Human-AI collaboration",
        "Generative AI",
        "Digital platforms",
        "Causal inference",
        "Field experiments",
      ],
      sameAs: [
        "https://profiles.utdallas.edu/zenan.chen",
        ...contactLinks
          .filter((link) => link.href.startsWith("https://"))
          .map((link) => link.href),
      ],
    },
    {
      "@type": "Organization",
      "@id": organizationId,
      additionalType: "https://schema.org/CollegeOrUniversity",
      name: "The University of Texas at Dallas",
      url: "https://www.utdallas.edu/",
      description:
        "Zenan Chen's employing university and the institutional affiliation for this academic profile.",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "faculty contact",
        email: `mailto:${cvHeader.emails[0]}`,
        telephone: cvHeader.telephone,
        url: `${identity.siteUrl}/contact`,
        availableLanguage: ["English", "Chinese"],
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: cvHeader.addressLine1,
        addressLocality: "Richardson",
        addressRegion: "TX",
        postalCode: "75080",
        addressCountry: "US",
      },
    },
  ],
};

export default function HomeStructuredData() {
  return (
    <Head>
      <script
        id="home-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
    </Head>
  );
}
