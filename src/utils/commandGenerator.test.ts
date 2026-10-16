import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTargetId, generateBotCommands, generateManagementCommands } from './commandGenerator.ts';
import type { BotConfig } from '../types/index.ts';

test('normalizeTargetId handles normal channels, test mode and missing minus', () => {
  assert.equal(normalizeTargetId('1001234567890', false), '-1001234567890');
  assert.equal(normalizeTargetId('-1001234567890', false), '-1001234567890');
  assert.equal(normalizeTargetId('-1001234567890', true), 'this');
  assert.equal(normalizeTargetId('', false), '-100XXXXXXXXXX');
  assert.equal(normalizeTargetId('', true), 'this');
});

test('generateBotCommands creates accurate command lines from prompt example', () => {
  const config: BotConfig = {
    channelId: '1001234567890',
    isTestMode: false,
    region: 'k',
    group: '51.1',
    delOld: true,
    picOnly: false,
    leadingZero: '0',
    headerTemplate: '<br><i>🔖 Графік відключень <b>на {dd}, {d} ({fdw})</b>:</i>',
    periodTemplate: '▪️<b><i>{s} - {f} ({h} год.)</i></b>',
    svitlobotKey: 'AAABBBCCCD',
    emptyTemplate: '<b>-відключень не заплановано</b>',
    sstMode: 'earlier_of_both',
    sstValue: 22,
    ecValue: 1,
    enableEmptySchedule: true,
  };

  const commands = generateBotCommands(config);
  const commandTexts = commands.map((c) => c.command);

  assert.ok(commandTexts.includes('-1001234567890 k 51.1 +delold'));
  assert.ok(commandTexts.includes('-1001234567890 k ls 0'));
  assert.ok(commandTexts.includes('-1001234567890 k fl <br><i>🔖 Графік відключень <b>на {dd}, {d} ({fdw})</b>:</i>'));
  assert.ok(commandTexts.includes('▪️<b><i>{s} - {f} ({h} год.)</i></b>') || commandTexts.some(c => c.includes('pt ▪️<b><i>{s} - {f} ({h} год.)</i></b>')));
  assert.ok(commandTexts.includes('-1001234567890 k key AAABBBCCCD'));
  assert.ok(commandTexts.includes('-1001234567890 k et <b>-відключень не заплановано</b>'));
  assert.ok(commandTexts.includes('-1001234567890 k sst -22'));
  assert.ok(commandTexts.includes('-1001234567890 k ec 1'));
});

test('generateBotCommands handles sst modes: specific_time and other_groups', () => {
  const baseConfig: BotConfig = {
    channelId: '-100123',
    isTestMode: false,
    region: 'r',
    group: '2.2',
    delOld: false,
    picOnly: false,
    leadingZero: '_',
    headerTemplate: 'Header',
    periodTemplate: 'Period',
    svitlobotKey: '',
    emptyTemplate: 'Empty',
    sstMode: 'specific_time',
    sstValue: 20,
    ecValue: 2,
    enableEmptySchedule: true,
  };

  const commandsTime = generateBotCommands(baseConfig);
  assert.ok(commandsTime.some((c) => c.command === '-100123 r sst 20'));

  const otherGroupsConfig: BotConfig = {
    ...baseConfig,
    sstMode: 'other_groups',
  };
  const commandsOther = generateBotCommands(otherGroupsConfig);
  assert.ok(commandsOther.some((c) => c.command === '-100123 r sst -1'));
});

test('generateManagementCommands generates valid deletion commands', () => {
  const config: BotConfig = {
    channelId: '-100999',
    isTestMode: false,
    region: 'o',
    group: '3.1',
    delOld: false,
    picOnly: false,
    leadingZero: '0',
    headerTemplate: '',
    periodTemplate: '',
    svitlobotKey: 'KEY',
    emptyTemplate: '',
    sstMode: 'disabled',
    sstValue: 20,
    ecValue: 1,
    enableEmptySchedule: false,
  };

  const mgmt = generateManagementCommands(config);
  assert.equal(mgmt.deleteSub, '-100999 o del');
  assert.equal(mgmt.deleteKey, '-100999 o key del');
});
