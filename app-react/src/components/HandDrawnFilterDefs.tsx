import React from 'react';

/**
 * Global hidden SVG filters that give borders and strokes a genuine
 * chunky felt-tip Sharpie marker (outer) and pencil/pen (inner) wobble without blurring text.
 */
export const HandDrawnFilterDefs: React.FC = () => (
  <svg
    aria-hidden="true"
    className="pointer-events-none fixed w-0 h-0 overflow-hidden"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      {/* Bold Chunky Felt-Tip Marker (Spidol Tebal) Wobble for Outer Cards */}
      <filter id="wobble-card" x="-8%" y="-8%" width="116%" height="116%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.018"
          numOctaves="3"
          result="noise"
          seed="7"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale="5.5"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>

      {/* Finer Sketchy Pencil / Pen Wobble for Inner Elements, Pills & Badges */}
      <filter id="wobble-sketch" x="-8%" y="-8%" width="116%" height="116%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.045"
          numOctaves="3"
          result="noise"
          seed="12"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale="3.6"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>
);
