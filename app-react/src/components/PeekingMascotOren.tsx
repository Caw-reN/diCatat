import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { MascotMood } from './MascotOren';

interface PeekingMascotOrenProps {
  mood: MascotMood;
  message: string;
}

const moodBadgeMeta: Record<
  MascotMood,
  { shortText: string; bg: string; title: string }
> = {
  happy: {
    shortText: 'Aman Bos!',
    bg: 'bg-mint',
    title: 'Mode Hemat & Aman',
  },
  warning: {
    shortText: 'Mulai Mepet!',
    bg: 'bg-highlight',
    title: 'Mode Waspada Budget!',
  },
  crying: {
    shortText: 'Overbudget!',
    bg: 'bg-coral',
    title: 'Darurat Dompet!',
  },
  scanning: {
    shortText: 'Cek Struk...',
    bg: 'bg-sky',
    title: 'Detektif Struk AI',
  },
  sleeping: {
    shortText: 'Zzz...',
    bg: 'bg-paper-warm',
    title: 'Si Oren Santai',
  },
};

/**
 * Peeking Si Oren Mascot that grips the top marker border of the Total Balance card!
 * - Shows a cute peeking cat head + two little orange paws resting on the top border edge
 *   + a tiny clickable mood pill ("Overbudget!" / "Aman Bos!").
 * - When clicked, pops open a clean hand-drawn speech bubble with the full message!
 */
export const PeekingMascotOren: React.FC<PeekingMascotOrenProps> = ({
  mood,
  message,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  const meta = moodBadgeMeta[mood];

  return (
    <div ref={containerRef} className="relative select-none z-30">
      {/* Clickable Peeking Cat + Mini Mood Pill */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex items-end gap-1 focus:outline-none cursor-pointer"
        title="Klik untuk lihat pesan Si Oren!"
      >
        {/* Tiny Thought Pill on the left of the peeking cat */}
        <motion.div
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className={`mb-5 px-2.5 py-0.5 rounded-full border-2 border-ink ${meta.bg} font-display font-bold text-[11px] text-ink shadow-sm flex items-center gap-1 group-hover:scale-105 transition-transform`}
          style={{ filter: 'url(#wobble-sketch)' }}
        >
          <span>{meta.shortText}</span>
          <span className="text-[9px] opacity-75">💬</span>
        </motion.div>

        {/* Peeking Cat Head & Paws Gripping the Card Border */}
        <motion.div
          animate={
            mood === 'warning' || mood === 'crying'
              ? { y: [0, -2, 0], rotate: [-1.5, 1.5, -1.5] }
              : { y: [0, -2.5, 0] }
          }
          transition={{
            duration: mood === 'warning' ? 0.6 : 2.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-20 h-14 sm:w-24 sm:h-16 shrink-0"
        >
          <svg
            viewBox="0 0 140 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible"
            style={{ filter: 'url(#wobble-sketch)' }}
          >
            {/* Left Ear */}
            <path
              d="M28 48 C21 20, 27 10, 52 27 Z"
              fill="#FF9F43"
              stroke="#2C2A29"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <path
              d="M33 41 C30 26, 33 19, 47 30 Z"
              fill="#FF8B94"
              stroke="#2C2A29"
              strokeWidth="2.3"
              strokeLinejoin="round"
            />

            {/* Right Ear */}
            <path
              d="M112 48 C119 20, 113 10, 88 27 Z"
              fill="#FF9F43"
              stroke="#2C2A29"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <path
              d="M107 41 C110 26, 107 19, 93 30 Z"
              fill="#FF8B94"
              stroke="#2C2A29"
              strokeWidth="2.3"
              strokeLinejoin="round"
            />

            {/* Accountant Green Visor Hat */}
            <path
              d="M38 28 C55 19, 85 19, 102 28 L108 36 C84 29, 56 29, 32 36 Z"
              fill="#A8E6CF"
              stroke="#2C2A29"
              strokeWidth="3.2"
              strokeLinejoin="round"
            />

            {/* Peeking Cat Upper Head Dome (resting on the y=78 border line) */}
            <path
              d="M24 78 C20 42, 42 25, 70 25 C98 25, 120 42, 116 78 Z"
              fill="#FF9F43"
              stroke="#2C2A29"
              strokeWidth="3.6"
              strokeLinejoin="round"
            />

            {/* Tabby Forehead "M" Mark */}
            <path
              d="M59 32 L64 40 L70 34 L76 40 L81 32"
              stroke="#E5801D"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Rosy Cheeks */}
            <ellipse cx="38" cy="69" rx="7" ry="4" fill="#FF8B94" opacity="0.85" />
            <ellipse cx="102" cy="69" rx="7" ry="4" fill="#FF8B94" opacity="0.85" />

            {/* Round Accountant Glasses */}
            <circle
              cx="50"
              cy="56"
              r="14"
              fill="rgba(255, 253, 247, 0.5)"
              stroke="#2C2A29"
              strokeWidth="3.2"
            />
            <circle
              cx="90"
              cy="56"
              r="14"
              fill="rgba(255, 253, 247, 0.5)"
              stroke="#2C2A29"
              strokeWidth="3.2"
            />
            <path d="M64 56 Q70 51 76 56" stroke="#2C2A29" strokeWidth="3.2" fill="none" />

            {/* EYES BY MOOD */}
            {mood === 'happy' && (
              <>
                <path
                  d="M43 56 Q50 48 57 56 M83 56 Q90 48 97 56"
                  stroke="#2C2A29"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M63 69 Q66.5 73 70 69.5 Q73.5 73 77 69"
                  stroke="#2C2A29"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            )}

            {mood === 'warning' && (
              <>
                <circle cx="50" cy="56" r="4.5" fill="#2C2A29" />
                <circle cx="48.5" cy="54.5" r="1.5" fill="#FFF" />
                <circle cx="90" cy="56" r="4.5" fill="#2C2A29" />
                <circle cx="88.5" cy="54.5" r="1.5" fill="#FFF" />
                <path
                  d="M62 71 Q66 67 70 71 Q74 75 78 71"
                  stroke="#2C2A29"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Sweat Drop */}
                <path
                  d="M114 38 C114 38, 121 48, 114 52 C107 48, 114 38, 114 38 Z"
                  fill="#A0C4FF"
                  stroke="#2C2A29"
                  strokeWidth="2.4"
                />
              </>
            )}

            {mood === 'crying' && (
              <>
                <path
                  d="M44 51 L55 56 L44 61 M96 51 L85 56 L96 61"
                  stroke="#2C2A29"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Tears streaming down */}
                <path
                  d="M46 63 Q43 72 45 78 M94 63 Q97 72 95 78"
                  stroke="#A0C4FF"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M64 73 C64 66, 76 66, 76 73 Z"
                  fill="#FF8B94"
                  stroke="#2C2A29"
                  strokeWidth="2.6"
                />
              </>
            )}

            {(mood === 'sleeping' || mood === 'scanning') && (
              <>
                <path
                  d="M43 56 Q50 63 57 56 M83 56 Q90 63 97 56"
                  stroke="#2C2A29"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            )}

            {/* Little Pink Nose peeking over the edge */}
            <path
              d="M67 62 L73 62 L70 66 Z"
              fill="#FF8B94"
              stroke="#2C2A29"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />

            {/* Whiskers */}
            <path
              d="M23 61 L10 59 M23 67 L9 69 M117 61 L130 59 M117 67 L131 69"
              stroke="#2C2A29"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* TWO CUTE PAWS GRIPPING OVER THE CARD BORDER LINE (y = 74..88) */}
            <g>
              {/* Left Paw */}
              <ellipse
                cx="30"
                cy="80"
                rx="11"
                ry="7.5"
                fill="#FF9F43"
                stroke="#2C2A29"
                strokeWidth="3.2"
              />
              <path
                d="M26 78 L26 84 M34 78 L34 84"
                stroke="#2C2A29"
                strokeWidth="2.2"
                strokeLinecap="round"
              />

              {/* Right Paw */}
              <ellipse
                cx="110"
                cy="80"
                rx="11"
                ry="7.5"
                fill="#FF9F43"
                stroke="#2C2A29"
                strokeWidth="3.2"
              />
              <path
                d="M106 78 L106 84 M114 78 L114 84"
                stroke="#2C2A29"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </g>
          </svg>
        </motion.div>
      </button>

      {/* POPOVER SPEECH BUBBLE WHEN PEEKING CAT IS CLICKED */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.92 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              width: '280px',
              zIndex: 80,
            }}
            className="doodle-item-active bg-paper-card p-3.5 shadow-xl text-left"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span
                className={`px-2.5 py-0.5 rounded-full border border-ink ${meta.bg} font-display font-bold text-xs text-ink`}
              >
                🐾 Si Oren • {meta.title}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-lg hover:bg-paper-warm flex items-center justify-center text-ink-muted"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs sm:text-sm font-medium text-ink leading-relaxed">
              {message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

