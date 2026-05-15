import { useMemo } from "react";
import { addDays, formatDowShort, formatMonthShort, isSameCalendarDay, startOfTuesdayWeek } from "@/modules/frontdesk/utils/week";

type WeekStripProps = {
  selected: Date;
  onSelect: (day: Date) => void;
};

export function WeekStrip({ selected, onSelect }: WeekStripProps) {
  const tuesday = useMemo(() => startOfTuesdayWeek(selected), [selected]);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(tuesday, i)), [tuesday]);

  return (
    <div className="week-strip" role="tablist" aria-label="Week">
      {days.map((day) => {
        const active = isSameCalendarDay(day, selected);
        return (
          <button
            key={day.toISOString()}
            type="button"
            role="tab"
            aria-selected={active}
            className={`week-strip-day${active ? " week-strip-day-active" : ""}`}
            onClick={() => onSelect(new Date(day))}
          >
            <span className="week-strip-dow">{formatDowShort(day)}</span>
            <span className="week-strip-rest">
              {day.getDate()} {formatMonthShort(day)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
