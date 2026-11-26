import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import rough from 'roughjs';

export type MascotMood = 'happy' | 'warning' | 'crying' | 'scanning' | 'sleeping';

interface MascotOrenProps {
  mood: MascotMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  showBubble?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: 'w-44 h-44',
};

export const MascotOren: React.FC<MascotOrenProps> = ({
  mood,
  size = 'md',
  message,
  showBubble = true,
  className = '',
}) => {
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const svgBubbleRef = useRef<SVGSVGElement | null>(null);

  // Draw the speech bubble and badge with Rough.js so it looks genuinely drawn with a pencil/marker!
  useEffect(() => {
    const container = bubbleRef.current;
    const svg = svgBubbleRef.current;
    if (!container || !svg) return;

    const drawRoughBubble = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(180, Math.round(rect.width));
      const h = Math.max(76, Math.round(rect.height));

      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }

      const rc = rough.svg(svg);
      // Softly rounded hand-drawn speech bubble path with pointer tail on the left
      const r = 24;
      const tailY = Math.min(36, h / 2);
      const pathData = `
        M ${r + 12} 4
        L ${w - r} 4
        Q ${w - 4} 4 ${w - 4} ${r}
        L ${w - 4} ${h - r}
        Q ${w - 4} ${h - 4} ${w - r} ${h - 4}
        L ${r + 12} ${h - 4}
        Q 14 ${h - 4} 14 ${h - r}
        L 14 ${tailY + 8}
        L 3 ${tailY}
        L 14 ${tailY - 8}
        L 14 ${r}
        Q 14 4 ${r + 12} 4
        Z
      `;

      const node = rc.path(pathData, {
        fill: '#FFFFFF',
        fillStyle: 'solid',
        stroke: '#2C2A29',
        strokeWidth: 1.8,
        roughness: 1.25,
        bowing: 1.3,
      });
      svg.appendChild(node);
    };

    drawRoughBubble();
    const observer = new ResizeObserver(drawRoughBubble);
    observer.observe(container);
    return () => observer.disconnect();
  }, [message, mood]);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div
        key={mood}
        initial={{ scale: 0.92, rotate: -3 }}
        animate={{
          scale: 1,
          rotate: mood === 'warning' ? [-2, 2, -2] : [0, -2, 0],
          y: mood === 'happy' ? [0, -4, 0] : [0, -2, 0],
        }}
        transition={{
          duration: mood === 'warning' ? 0.5 : 2.6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`relative shrink-0 ${sizeMap[size]} select-none`}
      >
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          style={{ filter: 'url(#wobble-sketch)' }}
        >
          {/* Hand-sketched background circle */}
          <path
            d="M100 28 C144 26, 178 60, 176 105 C174 150, 141 182, 98 181 C54 180, 23 148, 25 103 C27 58, 56 30, 100 28 Z"
            fill={
              mood === 'happy'
                ? '#E2F8F0'
                : mood === 'warning'
                ? '#FFF3B0'
                : mood === 'crying'
                ? '#FFE5E7'
                : mood === 'scanning'
                ? '#E8F1FF'
                : '#FAF6EE'
            }
            stroke="#2C2A29"
            strokeWidth="3.2"
            strokeDasharray="9 6"
            strokeLinecap="round"
          />

          {/* Left Ear */}
          <path
            d="M42 84 C34 45, 42 32, 75 54 Z"
            fill="#FF9F43"
            stroke="#2C2A29"
            strokeWidth="3.8"
            strokeLinejoin="round"
          />
          <path
            d="M49 74 C44 53, 49 44, 68 58 Z"
            fill="#FF8B94"
            stroke="#2C2A29"
            strokeWidth="2.6"
            strokeLinejoin="round"
          />

          {/* Right Ear */}
          <path
            d="M158 84 C166 45, 158 32, 125 54 Z"
            fill="#FF9F43"
            stroke="#2C2A29"
            strokeWidth="3.8"
            strokeLinejoin="round"
          />
          <path
            d="M151 74 C156 53, 151 44, 132 58 Z"
            fill="#FF8B94"
            stroke="#2C2A29"
            strokeWidth="2.6"
            strokeLinejoin="round"
          />

          {/* Accountant Green Visor Hat */}
          <path
            d="M55 56 C78 44, 122 44, 145 56 L154 68 C120 58, 80 58, 46 68 Z"
            fill="#A8E6CF"
            stroke="#2C2A29"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path
            d="M62 53 C85 45, 115 45, 138 53"
            stroke="#2C2A29"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Cat Body / Shirt */}
          <path
            d="M54 146 C52 126, 148 126, 146 146 L154 176 C125 186, 75 186, 46 176 Z"
            fill="#FFFDF7"
            stroke="#2C2A29"
            strokeWidth="3.8"
            strokeLinejoin="round"
          />
          {/* Red Bowtie */}
          <path
            d="M86 146 L100 153 L114 146 L114 160 L100 153 L86 160 Z"
            fill="#FF8B94"
            stroke="#2C2A29"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="100" cy="153" r="4" fill="#FFE066" stroke="#2C2A29" strokeWidth="2.2" />

          {/* Cat Head */}
          <path
            d="M38 102 C36 67, 65 52, 100 52 C135 52, 164 67, 162 102 C160 135, 136 149, 100 149 C64 149, 40 135, 38 102 Z"
            fill="#FF9F43"
            stroke="#2C2A29"
            strokeWidth="3.8"
            strokeLinejoin="round"
          />

          {/* Orange Tabby Forehead Stripes ("M" oren mark) */}
          <path
            d="M86 62 L92 73 L100 65 L108 73 L114 62"
            stroke="#E5801D"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Cheek stripes */}
          <path d="M44 102 L56 104 M45 111 L57 111" stroke="#E5801D" strokeWidth="3" strokeLinecap="round" />
          <path d="M156 102 L144 104 M155 111 L143 111" stroke="#E5801D" strokeWidth="3" strokeLinecap="round" />

          {/* Cute Rosy Cheeks */}
          <ellipse cx="59" cy="115" rx="9" ry="5.5" fill="#FF8B94" opacity="0.85" />
          <ellipse cx="141" cy="115" rx="9" ry="5.5" fill="#FF8B94" opacity="0.85" />

          {/* Round Accountant Glasses (slightly asymmetric hand-drawn circles) */}
          <path
            d="M73 79 C84 78, 92 87, 92 98 C92 109, 83 117, 72 117 C61 117, 54 108, 54 97 C54 86, 62 80, 73 79 Z"
            fill="rgba(255, 253, 247, 0.45)"
            stroke="#2C2A29"
            strokeWidth="3.5"
          />
          <path
            d="M127 79 C138 79, 146 87, 146 98 C146 109, 137 117, 126 117 C115 117, 108 109, 108 98 C108 87, 116 79, 127 79 Z"
            fill="rgba(255, 253, 247, 0.45)"
            stroke="#2C2A29"
            strokeWidth="3.5"
          />
          {/* Glasses Bridge */}
          <path d="M92 98 Q100 92 108 98" stroke="#2C2A29" strokeWidth="3.5" fill="none" />

          {/* EYES & MOUTH BY MOOD */}
          {mood === 'happy' && (
            <>
              <path
                d="M64 98 Q73 87 82 98"
                stroke="#2C2A29"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M118 98 Q127 87 136 98"
                stroke="#2C2A29"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M88 115 Q94 123 100 116 Q106 123 112 115"
                stroke="#2C2A29"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <rect
                x="134"
                y="134"
                width="32"
                height="38"
                rx="6"
                transform="rotate(10 134 134)"
                fill="#FFE066"
                stroke="#2C2A29"
                strokeWidth="3"
              />
              <path d="M142 147 L158 150 M141 156 L154 158" stroke="#2C2A29" strokeWidth="2.5" strokeLinecap="round" />
            </>
          )}

          {mood === 'warning' && (
            <>
              <circle cx="73" cy="98" r="6" fill="#2C2A29" />
              <circle cx="71" cy="96" r="2" fill="#FFF" />
              <circle cx="127" cy="98" r="6" fill="#2C2A29" />
              <circle cx="125" cy="96" r="2" fill="#FFF" />
              <path d="M60 80 L82 85" stroke="#2C2A29" strokeWidth="3.2" strokeLinecap="round" />
              <path d="M140 80 L118 85" stroke="#2C2A29" strokeWidth="3.2" strokeLinecap="round" />
              <path
                d="M86 120 Q93 114 100 120 Q107 126 114 120"
                stroke="#2C2A29"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M155 72 C155 72, 165 85, 155 91 C145 85, 155 72, 155 72 Z"
                fill="#A0C4FF"
                stroke="#2C2A29"
                strokeWidth="2.8"
              />
            </>
          )}

          {mood === 'crying' && (
            <>
              <path d="M65 92 L79 98 L65 104" stroke="#2C2A29" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M135 92 L121 98 L135 104" stroke="#2C2A29" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
              <path
                d="M68 106 Q62 125 66 142"
                stroke="#A0C4FF"
                strokeWidth="6.5"
                strokeLinecap="round"
              />
              <path
                d="M132 106 Q138 125 134 142"
                stroke="#A0C4FF"
                strokeWidth="6.5"
                strokeLinecap="round"
              />
              <path
                d="M90 124 C90 112, 110 112, 110 124 Z"
                fill="#FF8B94"
                stroke="#2C2A29"
                strokeWidth="3.2"
              />
            </>
          )}

          {mood === 'scanning' && (
            <>
              <circle cx="73" cy="98" r="6.5" fill="#2C2A29" />
              <circle cx="75" cy="96" r="2.2" fill="#FFF" />
              <circle cx="127" cy="98" r="6.5" fill="#2C2A29" />
              <circle cx="129" cy="96" r="2.2" fill="#FFF" />
              <circle cx="100" cy="119" r="5" fill="#FF8B94" stroke="#2C2A29" strokeWidth="3.2" />
              <circle
                cx="148"
                cy="128"
                r="20"
                fill="rgba(160, 196, 255, 0.55)"
                stroke="#2C2A29"
                strokeWidth="4"
              />
              <path
                d="M162 143 L178 159"
                stroke="#2C2A29"
                strokeWidth="6.5"
                strokeLinecap="round"
              />
            </>
          )}

          {mood === 'sleeping' && (
            <>
              <path d="M64 98 Q73 107 82 98" stroke="#2C2A29" strokeWidth="3.8" strokeLinecap="round" fill="none" />
              <path d="M118 98 Q127 107 136 98" stroke="#2C2A29" strokeWidth="3.8" strokeLinecap="round" fill="none" />
              <path d="M94 117 Q100 121 106 117" stroke="#2C2A29" strokeWidth="3.2" strokeLinecap="round" fill="none" />
              <text x="148" y="65" fill="#2C2A29" fontFamily="Patrick Hand" fontWeight="bold" fontSize="22">
                Zzz
              </text>
            </>
          )}

          {/* Little pink nose */}
          <path
            d="M96 107 L104 107 L100 112 Z"
            fill="#FF8B94"
            stroke="#2C2A29"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />

          {/* Whiskers */}
          <path d="M36 106 L18 103 M36 114 L16 116" stroke="#2C2A29" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M164 106 L182 103 M164 114 L184 116" stroke="#2C2A29" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      </motion.div>

      {showBubble && message && (
        <div ref={bubbleRef} className="relative flex-1 pl-6 pr-5 py-3.5 text-sm leading-relaxed">
          {/* Genuine Rough.js Hand-Sketched Speech Bubble Outline */}
          <svg
            ref={svgBubbleRef}
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          />

          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="wobbly-box font-display font-bold text-xs tracking-wide px-3 py-0.5 bg-highlight text-ink inline-flex items-center gap-1.5">
                <span>Si Oren Akuntan</span>
              </span>
              <span className="text-xs font-semibold text-ink-muted">
                {mood === 'happy' && '• Mode Hemat'}
                {mood === 'warning' && '• Mode Waspada!'}
                {mood === 'crying' && '• Darurat Dompet!'}
                {mood === 'scanning' && '• Lagi Cek Struk...'}
                {mood === 'sleeping' && '• Santai Dulu~'}
              </span>
            </div>
            <p className="font-sans font-medium text-ink text-xs sm:text-sm leading-relaxed">
              {message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
