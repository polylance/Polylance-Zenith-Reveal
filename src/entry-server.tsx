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
        alternateName: [BRAND.formerName, BRAND.shortName, 'PolyLance Protocol'],
        description:
          'PolyLance Zenith (formerly PolyLance at polylance.codes) is a decentralized Web3 freelancing protocol on Polygon featuring non-custodial USDC and POL milestone escrow, soulbound reputation certificates, and a flat 5% total fee.',
        disambiguatingDescription:
          'Decentralized Web3 freelancing and milestone escrow protocol on the Polygon blockchain (formerly PolyLance at polylance.codes); unrelated to the Pylance Python language server.',
        slogan: BRAND.headline,
        knowsAbout: [
          'Polygon blockchain',
          'Non-custodial milestone escrow',
          'USDC freelance payments',
          'POL token payments',
          'Soulbound reputation certificates',
          'Decentralized freelancing',
          'Web3 freelancing platform',
        ],
        url: `${NEW_ORIGIN}/`,
        logo: {
          '@type': 'ImageObject',
          '@id': `${NEW_ORIGIN}/#logo`,
          url: `${NEW_ORIGIN}/android-chrome-512x512.png`,
          contentUrl: `${NEW_ORIGIN}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
          caption: 'PolyLance Zenith (formerly PolyLance) official hexagon logo',
        },
        image: `${NEW_ORIGIN}/android-chrome-512x512.png`,
        sameAs: [
          ...BRAND.socials.map((s) => s.href),
          'https://github.com/polylance',
          'https://polylance.codes/',
        ],
      },
      {
        '@type': 'WebApplication',
        '@id': `${NEW_ORIGIN}/#app`,
        name: BRAND.name,
        alternateName: [BRAND.formerName, BRAND.shortName],
        description:
          'Escrow-protected Web3 freelancing protocol on Polygon with non-custodial USDC/POL milestones, soulbound wallet reputation, and a flat 5% total fee.',
        url: `${NEW_ORIGIN}/`,
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Decentralized Freelance Marketplace',
        operatingSystem: 'Web, Polygon Blockchain',
        browserRequirements: 'Requires JavaScript and a Web3 wallet for on-chain actions',
        featureList: [
          'Non-custodial USDC and POL milestone escrow on Polygon',
          'Flat 5% total protocol fee (2.5% client + 2.5% freelancer)',
          'Soulbound reputation certificates minted to user wallets',
          'Wallet-only sign-in with zero email or phone collection',
          'On-chain milestone dispute arbitration',
        ],
        publisher: { '@id': `${NEW_ORIGIN}/#organization` },
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
        mainEntity: { '@id': `${NEW_ORIGIN}/#app` },
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

