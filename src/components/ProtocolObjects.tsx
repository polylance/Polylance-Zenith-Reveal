import React from 'react';

interface IconProps {
  className?: string;
}

export const EscrowVaultIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
    <rect x="4" y="6" width="24" height="20" rx="5" fill="var(--brand-tint)" stroke="var(--brand-text)" strokeWidth="1.5" />
    <circle cx="16" cy="16" r="4.5" fill="var(--surface)" stroke="var(--brand-text)" strokeWidth="1.5" />
    <circle cx="16" cy="16" r="1.5" fill="var(--brand-hi)" />
    <line x1="8" y1="26" x2="8" y2="28" stroke="var(--brand-text)" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="24" y1="26" x2="24" y2="28" stroke="var(--brand-text)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const CoinDiscIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
    <circle cx="16" cy="16" r="12" fill="var(--brand-tint)" stroke="var(--brand-text)" strokeWidth="1.5" />
    <circle cx="16" cy="16" r="8" fill="var(--surface)" stroke="var(--brand-hi)" strokeWidth="1.5" />
    <path d="M16 11V21M13 14.5C13 13.5 14.2 13 16 13C17.8 13 19 13.6 19 14.7C19 16 13 16 13 17.5C13 18.6 14.2 19 16 19C17.8 19 19 18.5 19 17.5" stroke="var(--brand-text)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const CertificateCardIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
    <rect x="4" y="7" width="24" height="18" rx="4" fill="var(--brand-tint)" stroke="var(--brand-text)" strokeWidth="1.5" />
    <circle cx="11" cy="15" r="3.5" fill="var(--surface)" stroke="var(--brand-hi)" strokeWidth="1.5" />
    <line x1="17" y1="13" x2="24" y2="13" stroke="var(--brand-text)" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="17" y1="17" x2="22" y2="17" stroke="var(--brand-text)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const ShieldLockIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
    <path
      d="M16 4L6 8.5V15.5C6 21.8 10.3 26.8 16 28.5C21.7 26.8 26 21.8 26 15.5V8.5L16 4Z"
      fill="var(--brand-tint)"
      stroke="var(--brand-text)"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path d="M12.5 16L15 18.5L20 13.5" stroke="var(--green-300)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const EscrowKeyIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
    <circle cx="11" cy="16" r="5" fill="var(--brand-tint)" stroke="var(--brand-text)" strokeWidth="1.5" />
    <circle cx="11" cy="16" r="1.5" fill="var(--brand-hi)" />
    <path d="M16 16H27V19.5M23 16V19" stroke="var(--brand-text)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const MilestoneFlagIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
    <line x1="9" y1="6" x2="9" y2="27" stroke="var(--brand-text)" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M9 7H23L20.5 11.5L23 16H9V7Z" fill="var(--brand-tint)" stroke="var(--brand-hi)" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);
