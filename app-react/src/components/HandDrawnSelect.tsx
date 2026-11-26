import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { DoodleIcon } from './DoodleIcon';

export interface HandDrawnSelectOption<T extends string | number = string | number> {
  value: T;
  label: string;
  icon?: string;
  sublabel?: string;
  color?: string;
}

interface HandDrawnSelectProps<T extends string | number = string | number> {
  value: T;
  onChange: (value: T) => void;
  options: HandDrawnSelectOption<T>[];
  placeholder?: string;
  className?: string;
  menuPlacement?: 'bottom' | 'top';
}

export function HandDrawnSelect<T extends string | number = string | number>({
  value,
  onChange,
  options,
  placeholder = 'Pilih...',
  className = '',
  menuPlacement = 'bottom',
}: HandDrawnSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={`relative ${isOpen ? 'z-50' : 'z-10'} ${className}`}
    >
      {/* Trigger Button — keep class stable so it never jumps on click */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`doodle-field w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-left flex items-center justify-between gap-2 ${
          isOpen ? 'bg-paper-card' : 'hover:bg-paper-warm'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {selectedOption?.icon && (
            <DoodleIcon name={selectedOption.icon} className="w-5 h-5" />
          )}
          <span className="truncate text-ink font-semibold">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.sublabel && (
            <span className="text-xs text-ink-muted truncate">
              ({selectedOption.sublabel})
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-ink shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
          style={{ filter: 'url(#wobble-sketch)' }}
        />
      </button>

      {/* Hand-Drawn Floating Popover Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            ...(menuPlacement === 'top'
              ? { bottom: 'calc(100% + 8px)' }
              : { top: 'calc(100% + 8px)' }),
            left: 0,
            right: 0,
            minWidth: '175px',
            zIndex: 80,
          }}
          className="doodle-item-active bg-paper p-2 space-y-1.5 max-h-52 overflow-y-auto shadow-xl"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-xs sm:text-sm text-left flex items-center justify-between gap-2 transition-colors ${
                  isSelected
                    ? 'doodle-item bg-highlight font-bold text-ink'
                    : 'rounded-xl hover:bg-paper-warm text-ink font-medium'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {opt.icon && (
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: opt.color || '#FAF6EE',
                      }}
                    >
                      <DoodleIcon name={opt.icon} className="w-5 h-5" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <span className="block truncate">{opt.label}</span>
                    {opt.sublabel && (
                      <span className="block text-[11px] text-ink-muted truncate">
                        {opt.sublabel}
                      </span>
                    )}
                  </div>
                </div>

                {isSelected && <Check className="w-4 h-4 text-ink shrink-0 stroke-[2.8]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
