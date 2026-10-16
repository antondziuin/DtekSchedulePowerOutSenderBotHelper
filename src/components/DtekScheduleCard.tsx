import React from 'react';
import { OutageInterval } from '../types/index.ts';
import { calculateHourSlots, SlotStatus } from '../utils/scheduleGrid.ts';
import {
  ElecOffIcon,
  ElecFirst30Icon,
  ElecSecond30Icon,
} from './ElecIcons.tsx';

interface DtekScheduleCardProps {
  regionName: string;
  groupName: string;
  intervalsToday: OutageInterval[];
  intervalsTomorrow?: OutageInterval[];
  showTwoDays?: boolean;
  isEmptyToday?: boolean;
  todayLabel?: string;
  tomorrowLabel?: string;
  updatedAt?: string;
}

export const HOUR_LABELS = [
  '00-01', '01-02', '02-03', '03-04', '04-05', '05-06',
  '06-07', '07-08', '08-09', '09-10', '10-11', '11-12',
  '12-13', '13-14', '14-15', '15-16', '16-17', '17-18',
  '18-19', '19-20', '20-21', '21-22', '22-23', '23-24',
];

export const DtekScheduleCard: React.FC<DtekScheduleCardProps> = ({
  regionName,
  groupName,
  intervalsToday,
  intervalsTomorrow,
  showTwoDays = true,
  isEmptyToday = false,
  todayLabel = '15 жовтня',
  tomorrowLabel = '16 жовтня',
  updatedAt = '15.10.2026 20:24',
}) => {
  const slotsToday = isEmptyToday
    ? new Array(24).fill('on')
    : calculateHourSlots(intervalsToday);

  const slotsTomorrow = intervalsTomorrow
    ? calculateHourSlots(intervalsTomorrow)
    : calculateHourSlots([
        { start: '11:00', end: '14:30', hours: 3.5 },
        { start: '20:00', end: '24:00', hours: 4 },
      ]);

  const renderSlotCell = (status: SlotStatus, key: number) => {
    switch (status) {
      case 'off':
        return (
          <div
            key={key}
            className="w-full h-8 sm:h-9 bg-[#e2e6ea] flex items-center justify-center p-0.5"
            title="Світла нема"
          >
            <ElecOffIcon className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-slate-900 shrink-0" />
          </div>
        );
      case 'first_30':
        return (
          <div
            key={key}
            className="w-full h-8 sm:h-9 flex relative overflow-hidden"
            title="Перші 30 хв. знеструмлено"
          >
            <div className="w-1/2 h-full bg-[#e2e6ea]" />
            <div className="w-1/2 h-full bg-white" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <ElecFirst30Icon className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 shrink-0" />
            </div>
          </div>
        );
      case 'second_30':
        return (
          <div
            key={key}
            className="w-full h-8 sm:h-9 flex relative overflow-hidden"
            title="Другі 30 хв. знеструмлено"
          >
            <div className="w-1/2 h-full bg-white" />
            <div className="w-1/2 h-full bg-[#e2e6ea]" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <ElecSecond30Icon className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 shrink-0" />
            </div>
          </div>
        );
      case 'on':
      default:
        return (
          <div
            key={key}
            className="w-full h-8 sm:h-9 bg-white"
            title="Світло є"
          />
        );
    }
  };

  return (
    <div className="w-full bg-white text-slate-900 p-2.5 sm:p-4 rounded-2xl shadow-md border border-slate-200 select-none font-sans">
      {/* Top Header Row with Title and Yellow Queue Pill */}
      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-1.5 sm:mb-2">
        <h2 className="text-sm sm:text-lg md:text-xl font-bold tracking-tight text-slate-900 leading-snug">
          Графік відключень ({regionName}):
        </h2>
        <div className="bg-[#fed658] text-slate-950 font-bold text-xs sm:text-sm md:text-base px-3 sm:px-4 py-0.5 sm:py-1 rounded-full shadow-xs shrink-0 border border-amber-300/60">
          Черга {groupName || '2.2'}
        </div>
      </div>

      {/* Timestamp */}
      <div className="text-[9px] sm:text-[11px] text-slate-500 mb-2 sm:mb-2.5">
        Дата та час останнього оновлення інформації на графіку: {updatedAt}
      </div>

      {/* Grid Table Container - table-fixed guarantees all 24 columns are strictly equal & perfectly aligned */}
      <div className="w-full overflow-hidden rounded-xl border border-slate-300 bg-white shadow-2xs">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            {/* Header & Date column (fixed width) */}
            <col className="w-[48px] sm:w-[62px]" />
            {/* Exactly 24 hour columns (strictly equal width fractions) */}
            {HOUR_LABELS.map((_, i) => (
              <col key={i} />
            ))}
          </colgroup>
          <thead>
            <tr className="bg-[#f8fafc] border-b border-slate-300">
              <th className="p-1 border-r border-slate-300 text-left align-middle bg-[#f8fafc]">
                <div className="text-[7px] sm:text-[9px] font-bold text-slate-800 leading-tight">
                  <div>Часові</div>
                  <div>проміжки</div>
                </div>
              </th>
              {HOUR_LABELS.map((label, idx) => (
                <th
                  key={idx}
                  className="p-0 border-r border-slate-300 last:border-r-0 align-middle text-center bg-[#f8fafc] font-normal"
                >
                  <div className="w-full h-12 sm:h-14 flex items-center justify-center overflow-hidden">
                    <span className="shrink-0 w-max text-[7px] sm:text-[8px] font-semibold text-slate-800 rotate-90 select-none tracking-tight leading-none">
                      {label}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Row 1: Today */}
            <tr className="border-b border-slate-300 last:border-b-0">
              <td className="p-1 border-r border-slate-300 font-bold text-slate-900 text-[7.5px] sm:text-[10px] leading-tight align-middle whitespace-nowrap bg-white">
                {todayLabel}
              </td>
              {slotsToday.map((status, idx) => (
                <td
                  key={idx}
                  className="p-0 border-r border-slate-300 last:border-r-0 align-middle text-center"
                >
                  {renderSlotCell(status, idx)}
                </td>
              ))}
            </tr>

            {/* Row 2: Tomorrow (optional / toggleable) */}
            {showTwoDays && (
              <tr>
                <td className="p-1 border-r border-slate-300 font-bold text-slate-900 text-[7.5px] sm:text-[10px] leading-tight align-middle whitespace-nowrap bg-white">
                  {tomorrowLabel}
                </td>
                {slotsTomorrow.map((status, idx) => (
                  <td
                    key={idx}
                    className="p-0 border-r border-slate-300 last:border-r-0 align-middle text-center"
                  >
                    {renderSlotCell(status, idx)}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Legend below the table (exact replica from screenshot) */}
      <div className="mt-2.5 sm:mt-3 pt-1 flex flex-wrap items-center gap-x-3 sm:gap-x-5 gap-y-1.5 text-[9px] sm:text-xs text-slate-800 font-medium">
        {/* Light ON */}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 sm:w-5 sm:h-5 border border-slate-300 bg-white rounded-xs shadow-2xs" />
          <span>Світло є</span>
        </div>

        {/* Light OFF */}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 sm:w-5 sm:h-5 border border-slate-300 bg-[#e2e6ea] rounded-xs flex items-center justify-center shadow-2xs">
            <ElecOffIcon className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-slate-900" />
          </div>
          <span>Світла нема</span>
        </div>

        {/* First 30 min */}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 sm:w-5 sm:h-5 border border-slate-300 rounded-xs flex relative overflow-hidden shadow-2xs">
            <div className="w-1/2 h-full bg-[#e2e6ea]" />
            <div className="w-1/2 h-full bg-white" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <ElecFirst30Icon className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <span>Перші 30 хв.</span>
        </div>

        {/* Second 30 min */}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 sm:w-5 sm:h-5 border border-slate-300 rounded-xs flex relative overflow-hidden shadow-2xs">
            <div className="w-1/2 h-full bg-white" />
            <div className="w-1/2 h-full bg-[#e2e6ea]" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <ElecSecond30Icon className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <span>Другі 30 хв.</span>
        </div>
      </div>
    </div>
  );
};
