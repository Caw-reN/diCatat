import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface HandDrawnDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  className?: string;
}

const MONTH_NAMES_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const DAY_HEADERS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const HandDrawnDatePicker: React.FC<HandDrawnDatePickerProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const todayStr = useMemo(() => toYMD(new Date()), []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return toYMD(d);
  }, []);

  const parsedDate = useMemo(() => {
    const parts = value.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0])) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date();
  }, [value]);

  const [viewYear, setViewYear] = useState<number>(parsedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(parsedDate.getMonth());

  useEffect(() => {
    setViewYear(parsedDate.getFullYear());
    setViewMonth(parsedDate.getMonth());
  }, [parsedDate]);

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

  const calendarCells = useMemo(() => {
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: { day: number | null; dateStr: string }[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push({ day: null, dateStr: `empty-${i}` });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(
        d
      ).padStart(2, '0')}`;
      cells.push({ day: d, dateStr });
    }
    return cells;
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const formatFriendlyDate = (ymd: string) => {
    const parts = ymd.split('-').map(Number);
    if (parts.length !== 3) return ymd;
    const [y, m, d] = parts;
    const shortMonth = MONTH_NAMES_ID[m - 1]?.slice(0, 3) || '';
    if (ymd === todayStr) return `Hari Ini (${d} ${shortMonth})`;
    if (ymd === yesterdayStr) return `Kemarin (${d} ${shortMonth})`;
    return `${d} ${shortMonth} ${y}`;
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger + Quick Chips Row */}
      <div className="flex items-center gap-1.5">
        {/* Quick "Hari Ini" & "Kemarin" 1-Click Chips */}
        <button
          type="button"
          onClick={() => {
            onChange(todayStr);
            setIsOpen(false);
          }}
          className={`px-2.5 py-2.5 text-xs font-display font-bold shrink-0 transition-all ${
            value === todayStr
              ? 'doodle-item-active bg-highlight text-ink'
              : 'doodle-item bg-paper-card text-ink-muted hover:bg-paper-warm'
          }`}
        >
          Hari Ini
        </button>

        <button
          type="button"
          onClick={() => {
            onChange(yesterdayStr);
            setIsOpen(false);
          }}
          className={`px-2.5 py-2.5 text-xs font-display font-bold shrink-0 transition-all ${
            value === yesterdayStr
              ? 'doodle-item-active bg-highlight text-ink'
              : 'doodle-item bg-paper-card text-ink-muted hover:bg-paper-warm'
          }`}
        >
          Kemarin
        </button>

        {/* Calendar Popover Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`doodle-field flex-1 min-w-0 px-3 py-2.5 text-xs font-semibold text-left flex items-center justify-between gap-1.5 ${
            isOpen ? 'bg-paper-card' : 'hover:bg-paper-warm'
          }`}
        >
          <span className="truncate text-ink">{formatFriendlyDate(value)}</span>
          <CalendarIcon
            className="w-3.5 h-3.5 text-ink shrink-0"
            style={{ filter: 'url(#wobble-sketch)' }}
          />
        </button>
      </div>

      {/* Hand-Drawn Pastel Notebook Calendar Popover (Opens upward so it never clips at the bottom of the modal) */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            right: 0,
            width: '264px',
            zIndex: 80,
          }}
          className="doodle-item-active bg-paper p-3.5 shadow-xl space-y-2"
        >
          {/* Month & Year Navigation Header */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="doodle-item w-7 h-7 bg-paper-card flex items-center justify-center hover:bg-highlight-soft"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-display font-bold text-xs sm:text-sm text-ink">
              🗓️ {MONTH_NAMES_ID[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="doodle-item w-7 h-7 bg-paper-card flex items-center justify-center hover:bg-highlight-soft"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {DAY_HEADERS_ID.map((d) => (
              <span
                key={d}
                className="text-[10px] font-display font-bold text-ink-muted py-0.5"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((cell) => {
              if (!cell.day) {
                return <div key={cell.dateStr} className="h-8" />;
              }
              const isSelected = cell.dateStr === value;
              const isToday = cell.dateStr === todayStr;

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => {
                    onChange(cell.dateStr);
                    setIsOpen(false);
                  }}
                  className={`h-8 text-xs font-display flex items-center justify-center transition-all ${
                    isSelected
                      ? 'doodle-item bg-highlight font-bold text-ink scale-105'
                      : isToday
                      ? 'doodle-item bg-mint-soft font-bold text-ink'
                      : 'rounded-lg hover:bg-paper-warm text-ink font-medium'
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Bottom Quick Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-dashed border-ink/25">
            <button
              type="button"
              onClick={() => {
                onChange(yesterdayStr);
                setIsOpen(false);
              }}
              className="text-[11px] font-display font-bold text-ink-muted hover:text-ink underline"
            >
              Pilih Kemarin
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(todayStr);
                setIsOpen(false);
              }}
              className="px-2.5 py-1 doodle-item bg-highlight-soft text-[11px] font-display font-bold text-ink"
            >
              ✨ Hari Ini
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

