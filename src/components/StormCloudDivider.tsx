import React from 'react';

interface StormCloudDividerProps {
  /** Background color of the section directly above the divider */
  topBg?: string;
  /** Background color of the section receiving this divider */
  bottomBg?: string;
  /** Flip wave horizontally for visual variety across alternate bands */
  flip?: boolean;
}

/**
 * Static 2-tone flat storm-cloud SVG section divider.
 * Rendered in Storm theme only via `.storm-only` (zero animations, aria-hidden).
 */
export const StormCloudDivider: React.FC<StormCloudDividerProps> = ({
  topBg = 'var(--bg)',
  bottomBg = 'var(--bg-alt)',
  flip = false,
}) => {
  return (
    <div
      className="storm-only w-full overflow-hidden leading-none select-none pointer-events-none"
      style={{ backgroundColor: topBg }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 104"
        preserveAspectRatio="none"
        className={`w-full h-[80px] sm:h-[100px] block ${flip ? '-scale-x-100' : ''}`}
      >
        {/* Layer 1: Upper flat thundercloud silhouette */}
        <path
          d="M0 54 Q110 14 230 44 Q330 6 480 42 Q610 10 760 40 Q900 12 1040 46 Q1180 16 1320 44 L1440 34 L1440 104 L0 104 Z"
          fill="#1B252B"
        />
        {/* Layer 2: Lower flat storm cloud shelf */}
        <path
          d="M0 74 Q140 44 290 68 Q430 34 590 66 Q730 40 890 68 Q1060 36 1230 66 Q1350 48 1440 62 L1440 104 L0 104 Z"
          fill="#232F36"
        />
        {/* Section surface cap */}
        <path
          d="M0 88 Q210 66 440 84 Q680 68 940 86 Q1190 68 1440 84 L1440 104 L0 104 Z"
          style={{ fill: bottomBg }}
        />
      </svg>
    </div>
  );
};

