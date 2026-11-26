import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { DoodleIcon } from './DoodleIcon';

/**
 * Custom Hand-Drawn Cat Ink Stamp SVG ("diCatat • SAH!")
 * Slams onto the top-right corner of the receipt paper like a real rubber ink stamp.
 */
const CatInkStamp: React.FC<{ color?: string }> = ({ color = '#E04F5F' }) => (
  <svg
    viewBox="0 0 130 130"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full select-none"
    style={{ filter: 'url(#wobble-sketch)' }}
  >
    {/* Outer Stamp Double Ring (Rough Rubber Stamp Border) */}
    <circle
      cx="65"
      cy="65"
      r="57"
      stroke={color}
      strokeWidth="4.5"
      strokeDasharray="18 3 9 2 24 3"
      fill="rgba(255, 253, 247, 0.88)"
    />
    <circle
      cx="65"
      cy="65"
      r="49"
      stroke={color}
      strokeWidth="2"
      strokeDasharray="10 4 16 3"
    />

    {/* Cute Hand-Drawn Cat Head Silhouette & Ears in the Center Top */}
    <path
      d="M44 48 L39 27 L55 37 Z"
      stroke={color}
      strokeWidth="3.2"
      strokeLinejoin="round"
      fill="rgba(224, 79, 95, 0.12)"
    />
    <path
      d="M86 48 L91 27 L75 37 Z"
      stroke={color}
      strokeWidth="3.2"
      strokeLinejoin="round"
      fill="rgba(224, 79, 95, 0.12)"
    />
    <path
      d="M41 52 C41 37, 89 37, 89 52 C89 65, 79 73, 65 73 C51 73, 41 65, 41 52 Z"
      stroke={color}
      strokeWidth="3.2"
      fill="rgba(224, 79, 95, 0.08)"
    />
    {/* Round Accountant Glasses on the Stamp Cat */}
    <circle cx="56" cy="52" r="7" stroke={color} strokeWidth="2.4" />
    <circle cx="74" cy="52" r="7" stroke={color} strokeWidth="2.4" />
    <path d="M63 52 L67 52" stroke={color} strokeWidth="2.4" />
    <path d="M53 52 Q56 49 59 52" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    <path d="M71 52 Q74 49 77 52" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    {/* Cat Whiskers */}
    <path
      d="M33 52 L42 53 M34 58 L43 57 M97 52 L88 53 M96 58 L87 57"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    {/* Cute w mouth */}
    <path
      d="M60 61 Q62.5 64 65 61.5 Q67.5 64 70 61"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
    />

    {/* Stamp Ribbon Banner Across the Bottom-Middle */}
    <g transform="rotate(-4 65 86)">
      <rect
        x="14"
        y="73"
        width="102"
        height="25"
        rx="5"
        fill="#FFFDF7"
        stroke={color}
        strokeWidth="3.2"
      />
      <text
        x="65"
        y="90"
        textAnchor="middle"
        fill={color}
        fontFamily="Fredoka, sans-serif"
        fontWeight="700"
        fontSize="17"
        letterSpacing="1"
      >
        diCatat!
      </text>
    </g>

    {/* Small Paw & Stars at the bottom of the stamp */}
    <text
      x="65"
      y="109"
      textAnchor="middle"
      fill={color}
      fontFamily="Plus Jakarta Sans, sans-serif"
      fontWeight="800"
      fontSize="8.5"
      letterSpacing="1.8"
    >
      ★ SAH TERCATAT ★
    </text>
  </svg>
);

export const HandDrawnToast: React.FC = () => {
  const { toast, dismissToast } = useFinanceStore();

  const themeByType = {
    expense: {
      accentBg: 'bg-coral-soft',
      badgeBg: 'bg-coral',
      stampColor: '#D9384A',
      label: 'Pengeluaran Baru',
    },
    income: {
      accentBg: 'bg-mint-soft',
      badgeBg: 'bg-mint',
      stampColor: '#1E8E5A',
      label: 'Pemasukan Baru',
    },
    transfer: {
      accentBg: 'bg-sky-soft',
      badgeBg: 'bg-sky',
      stampColor: '#2B6CB0',
      label: 'Transfer Antar Dompet',
    },
    info: {
      accentBg: 'bg-highlight-soft',
      badgeBg: 'bg-highlight',
      stampColor: '#D95F18',
      label: 'Update Jurnal',
    },
  };

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={dismissToast}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink/45 backdrop-blur-[2px] p-5 cursor-pointer select-none"
        >
          <div className="relative w-full max-w-md flex flex-col items-center">
            {/*
              OUTER CARD = HAND-DRAWN TORN NOTEBOOK PAPER SHEET (Lurus 0deg)
              - Uses `.doodle-notebook-sheet` with warm paper color, horizontal notebook lines,
                vertical red margin line, top ring-binder punch holes, and hand-drawn marker outline!
            */}
            <motion.div
              initial={{ scale: 0.9, y: 18, rotate: 0 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.92, y: 12, opacity: 0, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              style={{ transform: 'rotate(0deg)' }}
              className="doodle-notebook-sheet w-full px-6 pt-11 pb-8 sm:px-7 text-center space-y-5 relative cursor-default"
            >
              {/* Top Notebook Ring-Binder Holes (Lubang Kertas Binder Buku Jurnal) */}
              <div className="absolute top-3.5 inset-x-8 flex items-center justify-between pointer-events-none z-10">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <span
                    key={idx}
                    className="w-3.5 h-3.5 rounded-full bg-ink/20 border-2 border-ink"
                    style={{ filter: 'url(#wobble-sketch)' }}
                  />
                ))}
              </div>

              {/* TOP-RIGHT ANIMATED CAT INK STAMP ("diCatat!") — Tilted 15deg */}
              <motion.div
                initial={{ scale: 2.6, opacity: 0, rotate: -28, y: -30 }}
                animate={{ scale: 1, opacity: 0.94, rotate: 15, y: 0 }}
                transition={{
                  delay: 0.2,
                  type: 'spring',
                  stiffness: 520,
                  damping: 19,
                }}
                className="w-28 h-28 sm:w-32 sm:h-32 absolute -top-4 -right-3 sm:-right-4 z-30 pointer-events-none drop-shadow-sm"
              >
                <CatInkStamp color={themeByType[toast.type].stampColor} />
              </motion.div>

              {/* Category Doodle Icon (Clean Centered Icon without Checkmark Overlay) */}
              <div className="pt-2 flex flex-col items-center relative z-10">
                <motion.div
                  initial={{ scale: 0.6, rotate: 0 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.08, type: 'spring', stiffness: 420, damping: 20 }}
                  className={`doodle-item-active w-16 h-16 ${
                    themeByType[toast.type].accentBg
                  } flex items-center justify-center`}
                >
                  <DoodleIcon name={toast.icon || 'paw'} className="w-9 h-9" />
                </motion.div>

                <span className="mt-3 text-xs font-display font-bold uppercase tracking-wider text-ink-muted">
                  {themeByType[toast.type].label}
                </span>
              </div>

              {/* Title, Amount & Receipt Details (All Hand-Drawn Wobbly Boxes) */}
              <div className="space-y-3 relative z-10">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-ink">
                  {toast.title}
                </h2>

                {toast.amountText && (
                  <div
                    className={`py-3.5 px-4 doodle-item-active ${
                      themeByType[toast.type].accentBg
                    }`}
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block">
                      Nominal Tercatat
                    </span>
                    <span className="font-display font-bold text-2xl sm:text-3xl text-ink">
                      {toast.amountText}
                    </span>
                  </div>
                )}

                <div className="p-3 doodle-item bg-paper-card/90 text-xs sm:text-sm font-semibold text-ink">
                  {toast.subtitle}
                </div>
              </div>

              {/* Hand-Drawn CTA Button */}
              <div className="pt-1 relative z-10">
                <button
                  type="button"
                  onClick={dismissToast}
                  className="w-full py-3.5 doodle-btn bg-highlight font-display font-bold text-sm sm:text-base text-ink flex items-center justify-center gap-2 cursor-pointer"
                >
                  <DoodleIcon name="paw" className="w-5 h-5" />
                  <span>Sip, Lanjut!</span>
                </button>
              </div>

              {/* Hand-Drawn Torn Paper Zig-Zag Bottom Edge SVG */}
              <svg
                viewBox="0 0 400 18"
                preserveAspectRatio="none"
                className="absolute -bottom-3 left-1 right-1 w-[calc(100%-8px)] h-4 pointer-events-none z-20"
                style={{ filter: 'url(#wobble-sketch)' }}
              >
                <path
                  d="M0 0 L14 14 L28 2 L42 15 L56 2 L70 14 L84 2 L98 15 L112 2 L126 14 L140 2 L154 15 L168 2 L182 14 L196 2 L210 15 L224 2 L238 14 L252 2 L266 15 L280 2 L294 14 L308 2 L322 15 L336 2 L350 14 L364 2 L378 15 L392 3 L400 12 L400 0 Z"
                  fill="#FFFDF7"
                  stroke="#2C2A29"
                  strokeWidth="3.2"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
