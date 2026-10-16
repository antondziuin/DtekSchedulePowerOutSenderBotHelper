import test from 'node:test';
import assert from 'node:assert/strict';
import { formatGroupString } from './kievGroupService.ts';

test('formatGroupString combines group and subgroup correctly', () => {
  assert.equal(formatGroupString(20, 1), '20.1');
  assert.equal(formatGroupString(4, 2), '4.2');
  assert.equal(formatGroupString(1, 1), '1.1');
  assert.equal(formatGroupString(39, 1), '39.1');
  assert.equal(formatGroupString(60, 1), '60.1');
});

test('formatGroupString handles missing subgroup', () => {
  assert.equal(formatGroupString(5), '5');
  assert.equal(formatGroupString(12, null), '12');
});
