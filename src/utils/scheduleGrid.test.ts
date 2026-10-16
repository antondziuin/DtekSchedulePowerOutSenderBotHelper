import test from 'node:test';
import assert from 'node:assert/strict';
import { timeToMinutes, calculateHourSlots } from './scheduleGrid.ts';

test('timeToMinutes converts HH:MM to minutes correctly', () => {
  assert.equal(timeToMinutes('00:00'), 0);
  assert.equal(timeToMinutes('07:30'), 450);
  assert.equal(timeToMinutes('24:00'), 1440);
});

test('calculateHourSlots marks full hours, first_30, second_30 and on', () => {
  // Interval 1: 00:00 - 04:00 (hours 0, 1, 2, 3 should be off)
  // Interval 2: 07:30 - 10:00 (hour 7 should be second_30, 8 and 9 should be off)
  // Interval 3: 13:00 - 14:30 (hour 13 is off, hour 14 is first_30)
  const intervals = [
    { start: '00:00', end: '04:00', hours: 4 },
    { start: '07:30', end: '10:00', hours: 2.5 },
    { start: '13:00', end: '14:30', hours: 1.5 },
  ];

  const slots = calculateHourSlots(intervals);

  // Hour 0..3: off
  assert.equal(slots[0], 'off');
  assert.equal(slots[1], 'off');
  assert.equal(slots[2], 'off');
  assert.equal(slots[3], 'off');

  // Hour 4, 5, 6: on
  assert.equal(slots[4], 'on');
  assert.equal(slots[5], 'on');
  assert.equal(slots[6], 'on');

  // Hour 7 (07:00-08:00): starts at 07:30 -> second_30
  assert.equal(slots[7], 'second_30');
  assert.equal(slots[8], 'off');
  assert.equal(slots[9], 'off');
  assert.equal(slots[10], 'on');

  // Hour 13: 13:00-14:00 -> off
  assert.equal(slots[13], 'off');
  // Hour 14: 14:00-14:30 -> first_30
  assert.equal(slots[14], 'first_30');
  // Hour 15: on
  assert.equal(slots[15], 'on');
});
