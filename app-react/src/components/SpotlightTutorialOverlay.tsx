import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { DoodleIcon } from './DoodleIcon';
import { MascotOren } from './MascotOren';

interface SpotlightTutorialOverlayProps {
  isOpen: boolean;
  step: number; // 1..5
  onStepChange: (nextStep: number) => void;
  onFinish: () => void;
  userName: string;
}

interface SpotlightStepConfig {
  step: number;
  targetIds: string[]; // First visible element in DOM will be highlighted
  title: string;
  description: string;
  icon: string;
  badge: string;
}

const TUTORIAL_STEPS: SpotlightStepConfig[] = [
  {
    step: 1,
    targetIds: ['tour-balance-card'],
    title: '1. Kartu Total Saldo & Si Oren',
    description:
      'Di sini kamu bisa memantau total seluruh uangmu dan melihat ekspresi Si Oren yang mengintip sesuai kesehatan budget bulananmu!',
    icon: 'notebook',
    badge: 'Langkah 1 dari 5',
  },
  {
    step: 2,
    targetIds: ['tour-quick-add-mobile', 'tour-quick-add-desktop'],
    title: '2. Tombol (+) Catat Transaksi Cepat',
    description:
      'Tekan tombol (+) kuning ini kapan saja untuk mencatat Pengeluaran, Pemasukan, atau Transfer antar dompet lengkap dengan Numpad & Biaya Admin!',
    icon: 'pencil',
    badge: 'Langkah 2 dari 5',
  },
  {
    step: 3,
    targetIds: ['tour-ai-scan-mobile', 'tour-ai-scan-desktop'],
    title: '3. Scan Struk Otomatis (AI OCR)',
    description:
      'Malas ketik manual? Klik tombol kamera ini untuk foto struk belanjamu—Si Oren yang akan membaca angka dan tokonya secara otomatis!',
    icon: 'camera',
    badge: 'Langkah 3 dari 5',
  },
  {
    step: 4,
    targetIds: ['tour-stats-mobile', 'tour-stats-desktop'],
    title: '4. Menu Statistik & Kalender Harian',
    description:
      'Buka menu Statistik untuk melihat ringkasan pintar Si Oren, Donut Chart gambar tangan, serta Kalender pengeluaran harianmu.',
    icon: 'chart',
    badge: 'Langkah 4 dari 5',
  },
  {
    step: 5,
    targetIds: ['tour-budget-wallets-mobile', 'tour-budget-wallets-desktop'],
    title: '5. Menu Budget & Multi-Dompet',
    description:
      'Atur batas anggaran bulanan per kategori di menu Budget, dan kelola saldo Tunai, Bank, maupun E-Wallet di menu Dompet!',
    icon: 'wallet',
    badge: 'Langkah 5 dari 5',
  },
];

export const SpotlightTutorialOverlay: React.FC<SpotlightTutorialOverlayProps> = ({
  isOpen,
  step,
  onStepChange,
  onFinish,
  userName,
}) => {
  const [targetRect, setTargetRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const currentConfig =
    TUTORIAL_STEPS.find((s) => s.step === step) || TUTORIAL_STEPS[0];

  useEffect(() => {
    if (!isOpen) return;

    const updateSpotlightRect = () => {
      let foundEl: HTMLElement | null = null;
      for (const id of currentConfig.targetIds) {
        const el = document.getElementById(id);
        if (el) {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) {
            foundEl = el;
            break;
          }
        }
      }

      if (foundEl) {
        foundEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        const r = foundEl.getBoundingClientRect();
        const pad = 8;
        setTargetRect({
          top: Math.max(4, r.top - pad),
          left: Math.max(4, r.left - pad),
          width: r.width + pad * 2,
          height: r.height + pad * 2,
        });
      } else {
        setTargetRect(null);
      }
    };

    updateSpotlightRect();
    const timer = setTimeout(updateSpotlightRect, 180);
    window.addEventListener('resize', updateSpotlightRect);
    window.addEventListener('scroll', updateSpotlightRect, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateSpotlightRect);
      window.removeEventListener('scroll', updateSpotlightRect, true);
    };
  }, [isOpen, step, currentConfig.targetIds]);

  if (!isOpen) return null;

  const isTargetNearBottom =
    targetRect && targetRect.top > window.innerHeight * 0.52;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] pointer-events-auto select-none overflow-hidden">
        {/* Darkened Backdrop with Cutout Spotlight Hole */}
        {targetRect ? (
          <motion.div
            initial={false}
            animate={{
              top: targetRect.top,
              left: targetRect.left,
              width: targetRect.width,
              height: targetRect.height,
            }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            style={{
              position: 'fixed',
              boxShadow: '0 0 0 9999px rgba(28, 26, 25, 0.78)',
              borderRadius: '22px',
              pointerEvents: 'none',
            }}
            className="border-[4px] border-highlight z-[111]"
          >
            {/* Pulsing Hand-Drawn Yellow Ring Around Highlighted Menu */}
            <div className="absolute -inset-2 rounded-[26px] border-2 border-dashed border-highlight animate-pulse pointer-events-none" />
          </motion.div>
        ) : (
          <div className="fixed inset-0 bg-ink/75" />
        )}

        {/* Tutorial Explanation Card (Positioned opposite the highlighted element so it never covers it) */}
        <div
          className={`fixed inset-x-0 z-[115] flex justify-center px-4 ${
            isTargetNearBottom ? 'top-10 sm:top-16' : 'bottom-24 sm:bottom-12'
          }`}
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, y: isTargetNearBottom ? -16 : 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className="w-full max-w-md doodle-card bg-paper p-5 sm:p-6 space-y-4 shadow-2xl relative"
          >
            {/* Top Step Badge & Skip Button */}
            <div className="flex items-center justify-between gap-2">
              <span className="wobbly-box px-3 py-0.5 bg-highlight font-display font-bold text-xs text-ink">
                🐾 Tur Buku diCatat • {currentConfig.badge}
              </span>
              <button
                type="button"
                onClick={onFinish}
                className="text-xs font-display font-bold text-ink-muted hover:text-ink inline-flex items-center gap-1"
              >
                <span>Lewati</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Step Title & Description */}
            <div className="flex items-start gap-3.5">
              <div className="doodle-item-active w-12 h-12 bg-highlight-soft flex items-center justify-center shrink-0 mt-0.5">
                <DoodleIcon name={currentConfig.icon} className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-base sm:text-lg text-ink leading-snug">
                  {currentConfig.title}
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  {currentConfig.description}
                </p>
              </div>
            </div>

            {/* MiniMascot Note on Step 1 */}
            {step === 1 && (
              <div className="pt-1">
                <MascotOren
                  mood="happy"
                  size="sm"
                  message={`Halo ${userName}! Ikuti sorotan lampu kuning ini sebentar ya biar makin jago pakai diCatat!`}
                />
              </div>
            )}

            {/* Progress Dots & Prev/Next Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-dashed border-ink/20">
              {/* Step Dots */}
              <div className="flex items-center gap-1.5">
                {TUTORIAL_STEPS.map((s) => (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => onStepChange(s.step)}
                    className={`h-2.5 rounded-full border border-ink transition-all ${
                      s.step === step
                        ? 'w-6 bg-highlight'
                        : s.step < step
                        ? 'w-2.5 bg-mint'
                        : 'w-2.5 bg-paper-warm'
                    }`}
                    aria-label={`Langkah ${s.step}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => onStepChange(step - 1)}
                    className="px-3 py-2 doodle-item bg-paper-card font-display font-bold text-xs text-ink flex items-center gap-1 hover:bg-paper-warm"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Balik</span>
                  </button>
                )}

                {step < TUTORIAL_STEPS.length ? (
                  <button
                    type="button"
                    onClick={() => onStepChange(step + 1)}
                    className="px-4 py-2 doodle-btn bg-highlight font-display font-bold text-xs sm:text-sm text-ink flex items-center gap-1.5"
                  >
                    <span>Lanjut</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onFinish}
                    className="px-4 py-2 doodle-btn bg-mint font-display font-bold text-xs sm:text-sm text-ink flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Mulai Mencatat!</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

