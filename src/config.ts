/**
 * PolyLance Zenith Reveal Site Configuration
 * 
 * Single source of truth for domain transition, countdown instant,
 * features, problem comparisons, and FAQ structured data.
 */

export const NEW_ORIGIN = "https://polylancezenith.com";
export const OLD_DOMAIN = "polylance.codes";

export type ThemeName = "light" | "storm";
export const THEME_DEFAULT: ThemeName = "light";
export const THEME_STORAGE_KEY = "pl-theme";

export const OFFICIAL_HOSTS = [
  "polylancezenith.com",
  "www.polylancezenith.com",
  "localhost",
  "127.0.0.1",
];

// Absolute UTC instant for reveal: Thursday, 17 December 2026 at 12:00 AM IST
export const REVEAL_AT_UTC = "2026-12-16T18:30:00Z";

// Real project launch timestamp for progress bar
export const START_AT_UTC = "2026-11-10T00:00:00Z";
export const START_LABEL = "10 Nov 2026";

export const REVEAL_IST_LABEL = "17 Dec 2026, 12:00 AM IST";

export interface UpcomingFeature {
  id: string;
  stepNumber: string;
  title: string;
  copy: string;
}

export const UPCOMING_FEATURES: UpcomingFeature[] = [
  {
    id: "cleaner-interface",
    stepNumber: "01",
    title: "Cleaner interface",
    copy: "Fewer distractions, faster pages.",
  },
  {
    id: "smarter-search",
    stepNumber: "02",
    title: "Smarter search",
    copy: "Filter jobs by budget, milestones, skills and escrow status.",
  },
  {
    id: "profiles-certificates",
    stepNumber: "03",
    title: "Profiles and certificates",
    copy: "Your verified work and soulbound certificates, shown clearly.",
  },
  {
    id: "smoother-wallet",
    stepNumber: "04",
    title: "Smoother wallet flow",
    copy: "Clearer signing steps and gas guidance for Polygon and USDC.",
  },
];

export const TRUST_POINTS: string[] = [
  "Funds held in non-custodial escrow",
  "2.5% client + 2.5% freelancer = 5% total fee",
  "Wallet sign-in only. No email or phone stored",
];

export interface HowItWorksStep {
  stepNumber: number;
  title: string;
  description: string;
  note?: string;
}

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    stepNumber: 1,
    title: "Post a job and fund the escrow",
    description: "The client defines milestones and locks USDC or POL into a non-custodial smart contract before work begins.",
  },
  {
    stepNumber: 2,
    title: "Work in milestones",
    description: "The freelancer completes agreed deliverables with full certainty that payment is already backed on-chain.",
  },
  {
    stepNumber: 3,
    title: "Approve and release payment",
    description: "Once work is reviewed and approved, escrow releases funds directly to the freelancer's wallet.",
    note: "Disagreement? An arbitration flow resolves it, visible on-chain.",
  },
  {
    stepNumber: 4,
    title: "Earn reputation you own",
    description: "Completed work mints a soulbound reputation certificate directly to your wallet, portable anywhere.",
  },
];

export interface AudienceProblemRow {
  problem: string;
  solution: string;
}

export const FREELANCER_ROWS: AudienceProblemRow[] = [
  {
    problem: "Late or missing payment",
    solution: "Funds are locked in escrow before work starts.",
  },
  {
    problem: "High platform cuts",
    solution: "A flat 2.5% on the freelancer side.",
  },
  {
    problem: "Unfair, opaque disputes",
    solution: "An arbitration flow with on-chain visibility.",
  },
  {
    problem: "Reputation stuck on one platform",
    solution: "A soulbound certificate minted to your own wallet.",
  },
  {
    problem: "Bans and withdrawal holds",
    solution: "Non-custodial: you control your wallet.",
  },
];

export const CLIENT_ROWS: AudienceProblemRow[] = [
  {
    problem: "Hard to find trustworthy freelancers",
    solution: "Profiles backed by verifiable on-chain work history.",
  },
  {
    problem: "Fake reviews",
    solution: "Only real on-chain data, no seeded ratings.",
  },
  {
    problem: "Paying upfront with no protection",
    solution: "Milestone escrow, released only when you approve.",
  },
  {
    problem: "Hidden fees",
    solution: "A clear 2.5% client fee shown before you fund.",
  },
  {
    problem: "Cross-border payment friction",
    solution: "USDC / POL payments, no bank transfers.",
  },
];

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "What is PolyLance Zenith?",
    answer:
      "PolyLance Zenith (formerly PolyLance at polylance.codes) is a Web3 decentralized freelancing protocol on the Polygon blockchain—distinct from coding tools like Pylance. Clients fund non-custodial milestone escrow in USDC or POL, freelancers get paid when work is approved, and reputation lives in your own wallet.",
  },
  {
    question: "Why the new name?",
    answer:
      "PolyLance is now PolyLance Zenith. We changed the name to reflect a higher aim, while keeping the exact same mission to make freelancing fair, transparent, and non-custodial.",
  },
  {
    question: "Is polylance.codes down?",
    answer:
      "polylance.codes is currently under maintenance and is not available right now. PolyLance has evolved into PolyLance Zenith, and the official address is polylancezenith.com.",
  },
  {
    question: "When does the new interface arrive and what happens on 17 December?",
    answer:
      "The new PolyLance Zenith interface arrives on Thursday, 17 December 2026 at 12:00 AM IST (16 December 2026, 18:30 UTC). When the countdown reaches zero, the site transitions automatically to let you enter the new interface.",
  },
  {
    question: "What are the fees?",
    answer:
      "PolyLance Zenith charges a flat 5% total protocol fee split evenly: 2.5% on the client side and 2.5% on the freelancer side. Network gas fees on Polygon are separate.",
  },
  {
    question: "Which network and currencies are used?",
    answer:
      "The protocol runs on the Polygon network. Clients and freelancers fund and settle milestone escrows in USDC or POL.",
  },
  {
    question: "Do you store my email or phone number?",
    answer:
      "No. PolyLance Zenith uses wallet-only sign-in. We never collect, store, or ask for your email address, phone number, or seed phrase.",
  },
  {
    question: "What happens to my existing jobs, escrows and certificates?",
    answer:
      "All jobs, escrows, and soulbound reputation certificates live on-chain and remain tied directly to your wallet. Nothing is lost during the domain update or interface reveal.",
  },
  {
    question: "How do I make sure I'm on the real site?",
    answer:
      "Always look at the browser address bar to confirm it reads polylancezenith.com, type it yourself or use a saved bookmark, and never share your seed phrase. You can also paste any link into the Link Checker on this page.",
  },
];
