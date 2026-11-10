import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { BRAND } from './brand';
import { FAQ_ITEMS, NEW_ORIGIN } from './config';

export function render() {
  const html = renderToString(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Build single valid @graph JSON-LD directly from BRAND & FAQ_ITEMS config
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${NEW_ORIGIN}/#organization`,
        name: BRAND.name,
        alternateName: [BRAND.formerName, BRAND.shortName],
        description:
          'PolyLance Zenith (formerly PolyLance at polylance.codes) is a decentralized freelancing protocol on Polygon featuring non-custodial USDC and POL milestone escrow, soulbound reputation certificates, and a flat 5% total fee.',
        url: `${NEW_ORIGIN}/`,
        logo: `${NEW_ORIGIN}/android-chrome-512x512.png`,
        sameAs: BRAND.socials.map((s) => s.href),
      },
      {
        '@type': 'WebSite',
        '@id': `${NEW_ORIGIN}/#website`,
        name: BRAND.name,
        alternateName: [BRAND.formerName, BRAND.shortName],
        description: BRAND.seo.description,
        url: `${NEW_ORIGIN}/`,
        inLanguage: 'en',
        publisher: { '@id': `${NEW_ORIGIN}/#organization` },
      },
      {
        '@type': 'WebPage',
        '@id': `${NEW_ORIGIN}/#webpage`,
        url: `${NEW_ORIGIN}/`,
        name: BRAND.seo.title,
        description: BRAND.seo.description,
        inLanguage: 'en',
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: BRAND.seo.ogImage,
        },
        isPartOf: { '@id': `${NEW_ORIGIN}/#website` },
        about: { '@id': `${NEW_ORIGIN}/#organization` },
      },
      {
        '@type': 'FAQPage',
        '@id': `${NEW_ORIGIN}/#faq`,
        mainEntity: FAQ_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
      {
        '@type': 'Event',
        name: 'PolyLance Zenith (formerly PolyLance) new interface reveal',
        description:
          'PolyLance Zenith (formerly PolyLance) launches its redesigned Polygon freelancing interface at polylancezenith.com on 17 December 2026.',
        image: BRAND.seo.ogImage,
        startDate: '2026-12-17T00:00:00+05:30',
        eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        location: {
          '@type': 'VirtualLocation',
          url: `${NEW_ORIGIN}/`,
        },
        organizer: { '@id': `${NEW_ORIGIN}/#organization` },
      },
    ],
  };

  return { html, jsonLd: JSON.stringify(graph) };
}

