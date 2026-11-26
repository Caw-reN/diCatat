import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { DoodleIcon } from './DoodleIcon';

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
  icon?: string;
}

interface RoughDonutChartProps {
  data: DonutSlice[];
  size?: number;
  totalLabel?: string;
}

export const RoughDonutChart: React.FC<RoughDonutChartProps> = ({
  data,
  size = 240,
  totalLabel = 'Total Keluar',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const total = data.reduce((acc, item) => acc + item.value, 0);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    const rc = rough.svg(svg);
    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.4;

    if (total <= 0) {
      const emptyCircle = rc.circle(cx, cy, radius * 2, {
        fill: '#FAF6EE',
        fillStyle: 'hachure',
        stroke: '#2C2A29',
        strokeWidth: 2.5,
        roughness: 1.5,
      });
      svg.appendChild(emptyCircle);
    } else {
      let startAngle = -Math.PI / 2;

      data.forEach((slice) => {
        if (slice.value <= 0) return;
        const sliceAngle = (slice.value / total) * (Math.PI * 2);
        const endAngle = startAngle + sliceAngle;

        // If a single category is 100%, draw full rough circle
        if (sliceAngle >= Math.PI * 2 - 0.01) {
          const fullNode = rc.circle(cx, cy, radius * 2, {
            fill: slice.color,
            fillStyle: 'hachure',
            fillWeight: 2.5,
            hachureGap: 6,
            stroke: '#2C2A29',
            strokeWidth: 2.5,
            roughness: 1.4,
          });
          svg.appendChild(fullNode);
        } else {
          const arcNode = rc.arc(
            cx,
            cy,
            radius * 2,
            radius * 2,
            startAngle,
            endAngle,
            true,
            {
              fill: slice.color,
              fillStyle: 'hachure',
              fillWeight: 2.4,
              hachureGap: 5.5,
              stroke: '#2C2A29',
              strokeWidth: 2.5,
              roughness: 1.4,
            }
          );
          svg.appendChild(arcNode);
        }

        startAngle = endAngle;
      });
    }

    // Inner Donut Cutout with hand-drawn border
    const innerHole = rc.circle(cx, cy, radius * 1.08, {
      fill: '#FFFFFF',
      fillStyle: 'solid',
      stroke: '#2C2A29',
      strokeWidth: 2.5,
      roughness: 1.3,
    });
    svg.appendChild(innerHole);
  }, [data, size, total]);

  const formatShortRp = (val: number) => {
    if (val >= 1_000_000) return `Rp${(val / 1_000_000).toFixed(1)}jt`;
    if (val >= 1_000) return `Rp${Math.round(val / 1_000)}rb`;
    return `Rp${val}`;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg ref={svgRef} width={size} height={size} className="overflow-visible" />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-6">
          <span className="text-[11px] font-hand text-ink-muted uppercase tracking-wider">
            {totalLabel}
          </span>
          <span className="font-display font-bold text-base sm:text-lg text-ink">
            {formatShortRp(total)}
          </span>
        </div>
      </div>

      {/* Hand-drawn Legend */}
      <div className="w-full sm:w-auto flex-1 space-y-2.5">
        {data.map((slice) => {
          const pct = total > 0 ? Math.round((slice.value / total) * 100) : 0;
          return (
            <div
              key={slice.label}
              className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-paper border-2 border-ink shadow-doodle-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-4 h-4 rounded-md border-2 border-ink shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <DoodleIcon name={slice.icon || 'sparkle'} className="w-5 h-5" />
                <span className="text-xs sm:text-sm font-semibold truncate">{slice.label}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold font-display">{formatShortRp(slice.value)}</span>
                <span className="text-[11px] font-hand px-1.5 py-0.5 rounded-md bg-highlight border border-ink">
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

