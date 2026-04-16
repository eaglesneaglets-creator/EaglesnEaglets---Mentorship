import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
  isBefore,
  isAfter,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * DatePicker — custom calendar popover built with date-fns
 * Integrates with React Hook Form via Controller (passes value/onChange)
 */
const DatePicker = ({
  value,
  onChange,
  min,
  max,
  placeholder = 'Select date',
  label,
  error,
  className = '',
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(value ?? new Date());
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sync view month when value changes externally
  useEffect(() => {
    if (value) setViewMonth(value);
  }, [value]);

  const calDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewMonth)),
    end: endOfWeek(endOfMonth(viewMonth)),
  });

  const isDisabled = (day) => {
    if (min && isBefore(day, min)) return true;
    if (max && isAfter(day, max)) return true;
    return false;
  };

  const handleDay = (day) => {
    if (isDisabled(day)) return;
    onChange(day);
    setOpen(false);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}

      {/* Input trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`
          w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-left
          bg-white border rounded-xl transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1
          ${error ? 'border-red-400' : 'border-slate-200 hover:border-emerald-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
        <span className={value ? 'text-slate-800' : 'text-slate-400'}>
          {value ? format(value, 'MMM d, yyyy') : placeholder}
        </span>
      </button>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {/* Calendar popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 w-72"
          >
            {/* Month nav */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => setViewMonth((m) => subMonths(m, 1))}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm font-semibold text-slate-800">
                {format(viewMonth, 'MMMM yyyy')}
              </span>
              <button
                type="button"
                onClick={() => setViewMonth((m) => addMonths(m, 1))}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {calDays.map((day) => {
                const selected = value && isSameDay(day, value);
                const today = isToday(day);
                const inMonth = isSameMonth(day, viewMonth);
                const disabled = isDisabled(day);

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleDay(day)}
                    className={`
                      h-8 w-8 mx-auto rounded-lg text-xs font-medium transition-all duration-100
                      ${selected ? 'bg-emerald-500 text-white shadow-sm' : ''}
                      ${!selected && today ? 'border border-emerald-400 text-emerald-600' : ''}
                      ${!selected && !today && inMonth && !disabled ? 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700' : ''}
                      ${!inMonth ? 'text-slate-300' : ''}
                      ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>

            {/* Clear */}
            {value && (
              <button
                type="button"
                onClick={() => { onChange(null); setOpen(false); }}
                className="mt-3 w-full text-xs text-slate-400 hover:text-red-500 transition-colors text-center"
              >
                Clear date
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

DatePicker.propTypes = {
  value: PropTypes.instanceOf(Date),
  onChange: PropTypes.func.isRequired,
  min: PropTypes.instanceOf(Date),
  max: PropTypes.instanceOf(Date),
  placeholder: PropTypes.string,
  label: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

export default DatePicker;
