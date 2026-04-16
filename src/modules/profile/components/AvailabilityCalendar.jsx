import { useState } from 'react';
import PropTypes from 'prop-types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 – 20:00

const formatHour = (h) => {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h;
  return `${hour}${ampm}`;
};

const slotKey = (dayIdx, hour) => `${dayIdx}-${hour}`;

/**
 * AvailabilityCalendar — weekly grid for mentor availability slots
 * readOnly: Eaglet viewing a mentor's profile (no editing)
 * slots: [{ day_of_week, start_time, end_time, id }] from API
 * onAdd: (dayIdx, startTime, endTime) => void
 * onRemove: (slotId) => void
 */
const AvailabilityCalendar = ({
  slots = [],
  onAdd,
  onRemove,
  readOnly = false,
  isLoading = false,
  className = '',
}) => {
  const [hoveredSlot, setHoveredSlot] = useState(null);

  // Build a Set of occupied keys for O(1) lookup
  const occupiedKeys = new Set();
  const slotMap = {}; // key → slot object
  slots.forEach((slot) => {
    const startHour = parseInt(slot.start_time?.split(':')[0] ?? 0, 10);
    const key = slotKey(slot.day_of_week, startHour);
    occupiedKeys.add(key);
    slotMap[key] = slot;
  });

  const handleCellClick = (dayIdx, hour) => {
    if (readOnly) return;
    const key = slotKey(dayIdx, hour);
    if (occupiedKeys.has(key)) {
      const slot = slotMap[key];
      onRemove?.(slot.id);
    } else {
      const start = `${String(hour).padStart(2, '0')}:00:00`;
      const end = `${String(hour + 1).padStart(2, '0')}:00:00`;
      onAdd?.(dayIdx, start, end);
    }
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse bg-slate-100 rounded-2xl h-48 ${className}`} />
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="min-w-[600px]">
        {/* Header row */}
        <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
          <div />
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-slate-500 py-1">
              {d.slice(0, 3)}
            </div>
          ))}
        </div>

        {/* Time rows */}
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="grid gap-1 mb-1"
            style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}
          >
            {/* Hour label */}
            <div className="text-right pr-2 text-xs text-slate-400 leading-6 pt-0.5">
              {formatHour(hour)}
            </div>

            {/* Day cells */}
            {DAYS.map((_, dayIdx) => {
              const key = slotKey(dayIdx, hour);
              const occupied = occupiedKeys.has(key);

              return (
                <button
                  key={dayIdx}
                  type="button"
                  onClick={() => handleCellClick(dayIdx, hour)}
                  onMouseEnter={() => setHoveredSlot(key)}
                  onMouseLeave={() => setHoveredSlot(null)}
                  disabled={readOnly && !occupied}
                  className={`
                    h-6 rounded transition-all duration-150
                    ${occupied
                      ? 'bg-emerald-400 hover:bg-emerald-500 shadow-sm'
                      : readOnly
                      ? 'bg-slate-100 cursor-default'
                      : hoveredSlot === key
                      ? 'bg-emerald-100 border border-emerald-300'
                      : 'bg-slate-100 hover:bg-emerald-50 border border-transparent hover:border-emerald-200'}
                  `}
                  title={
                    occupied
                      ? readOnly
                        ? `Available ${formatHour(hour)}–${formatHour(hour + 1)}`
                        : `Remove ${formatHour(hour)}–${formatHour(hour + 1)}`
                      : readOnly
                      ? ''
                      : `Add ${formatHour(hour)}–${formatHour(hour + 1)}`
                  }
                />
              );
            })}
          </div>
        ))}
      </div>

      {!readOnly && (
        <p className="mt-2 text-xs text-slate-400 text-center">
          Click a cell to add or remove a slot · {slots.length} slot{slots.length !== 1 ? 's' : ''} set
        </p>
      )}
    </div>
  );
};

AvailabilityCalendar.propTypes = {
  slots: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      day_of_week: PropTypes.number.isRequired,
      start_time: PropTypes.string.isRequired,
      end_time: PropTypes.string.isRequired,
    })
  ),
  onAdd: PropTypes.func,
  onRemove: PropTypes.func,
  readOnly: PropTypes.bool,
  isLoading: PropTypes.bool,
  className: PropTypes.string,
};

export default AvailabilityCalendar;
