import type { OutageInterval } from '../types/index.ts';

export type SlotStatus = 'on' | 'off' | 'first_30' | 'second_30';

/**
 * Parses time string like "07:30" or "07:00" to minutes from start of day
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

/**
 * Calculates slot status ('on' | 'off' | 'first_30' | 'second_30')
 * for each hour slot 0..23 given a list of outage intervals
 */
export function calculateHourSlots(intervals: OutageInterval[]): SlotStatus[] {
  const slots: SlotStatus[] = new Array(24).fill('on');

  if (!intervals || intervals.length === 0) {
    return slots;
  }

  for (let hour = 0; hour < 24; hour++) {
    const slotStartMin = hour * 60;
    const slotMidMin = slotStartMin + 30;
    const slotEndMin = (hour + 1) * 60;

    let firstHalfOff = false;
    let secondHalfOff = false;

    for (const int of intervals) {
      const intStartMin = timeToMinutes(int.start);
      // If end is "24:00", treat as 24*60 = 1440
      const intEndMin = int.end.trim() === '24:00' ? 1440 : timeToMinutes(int.end);

      // Check first 30 mins: slotStartMin .. slotMidMin
      if (intStartMin < slotMidMin && intEndMin > slotStartMin) {
        firstHalfOff = true;
      }

      // Check second 30 mins: slotMidMin .. slotEndMin
      if (intStartMin < slotEndMin && intEndMin > slotMidMin) {
        secondHalfOff = true;
      }
    }

    if (firstHalfOff && secondHalfOff) {
      slots[hour] = 'off';
    } else if (firstHalfOff && !secondHalfOff) {
      slots[hour] = 'first_30';
    } else if (!firstHalfOff && secondHalfOff) {
      slots[hour] = 'second_30';
    } else {
      slots[hour] = 'on';
    }
  }

  return slots;
}
