import React from 'react';

interface RoughProgressBarProps {
  percent: number;
  color: string;
  height?: number;
  className?: string;
}

/**
 * Clean Hand-Drawn Progress Bar:
 * - Outer track has a genuine wobbly hand-drawn marker outline + second sketchy stroke.
 * - Inner fill bar ALSO has a wobbly hand-drawn outline (`url(#wobble-sketch)`) with a
 *   clean solid pastel fill (no dizzying crosshatch lines!) and removes `overflow-hidden`
 *   so the wobbly border is never clipped into a straight line!
 */
export const RoughProgressBar: React.FC<RoughProgressBarProps> = ({
  percent,
  color,
  height = 22,
  className = '',
}) => {
  const clampedPct = Math.max(0, Math.min(100, percent));

  return (
    <div
      className={`doodle-item w-full bg-paper-warm p-1 select-none relative ${className}`}
      style={{ height }}
    >
      {clampedPct > 0 && (
        <div
          className="h-full relative transition-all duration-500"
          style={{
            width: `${Math.max(6, clampedPct)}%`,
            backgroundColor: color,
            borderRadius: '14px 18px 15px 16px / 16px 14px 17px 15px',
            border: '2.2px solid #2C2A29',
            filter: 'url(#wobble-sketch)',
          }}
        >
          {/* Subtle hand-drawn highlight shine line along the top of the marker fill */}
          <div
            className="absolute top-1 left-2.5 right-2.5 h-[2.5px] rounded-full bg-white/55 pointer-events-none"
          />
        </div>
      )}
    </div>
  );
};
