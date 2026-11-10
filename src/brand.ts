/**
 * PolyLance Zenith Brand & SEO Configuration
 * 
 * Single source of truth for product identity, claims, social URLs, and SEO metadata.
 */

export const BRAND = {
  name: "PolyLance Zenith",
  shortName: "PL Zenith",
  formerName: "PolyLance",
  definition:
    "PolyLance Zenith is a freelancing protocol on Polygon. Clients fund milestone escrow in USDC or POL, freelancers get paid when work is approved, and reputation lives in your own wallet.",
  headline: "New name. Old passion. Higher aim.",
  headlineAlternates: [
    "We changed the name, not the mission.",
    "New name, same passion for fair work.",
    "Same passion. A higher aim.",
  ],
  subline:
    "PolyLance is now PolyLance Zenith. Same mission to make freelancing fair, now aiming higher.",
  zenithMeaning: "Zenith: the highest point.",
  socials: [
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/polylance-zenith-5727113ba/",
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/polylance/",
    },
    {
      label: "X",
      href: "https://x.com/PolyLance26",
    },
  ],
  seo: {
    // <= 60 chars
    title: "PolyLance Zenith | Escrow-Protected Freelancing on Polygon",
    // 140-160 chars
    description:
      "PolyLance Zenith (formerly PolyLance) is a Polygon freelancing protocol with non-custodial milestone escrow and a 5% fee. New UI arrives 17 December 2026.",
    canonical: "https://polylancezenith.com/",
    ogImage: "https://polylancezenith.com/og-image.png",
    ogImageAlt: "PolyLance Zenith — New interface arriving 17 December 2026",
  },
} as const;

export const LOGO_NOTE =
  "Existing hexagon mark asset preserved; wordmark rendered in Hanken Grotesk 800.";
