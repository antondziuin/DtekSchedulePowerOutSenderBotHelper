import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTimeWithLeading,
  renderHeaderTemplate,
  renderPeriodTemplate,
  buildFullTelegramText,
  parseTelegramHtml,
  DEFAULT_CONTEXT_TODAY,
} from './telegramFormatter.ts';

test('formatTimeWithLeading handles 0 and _ modes', () => {
  assert.equal(formatTimeWithLeading('09:00', '0'), '09:00');
  assert.equal(formatTimeWithLeading('09:00', '_'), '9:00');
  assert.equal(formatTimeWithLeading('14:30', '_'), '14:30');
});

test('renderHeaderTemplate replaces variables and <br>', () => {
  const tpl = '<br><i>🔖 Графік на <b>{dd}, {d} ({fdw})</b>:</i>';
  const res = renderHeaderTemplate(tpl, DEFAULT_CONTEXT_TODAY);
  assert.ok(res.includes('на <b>сьогодні, 15.03.2026 (Неділя)</b>'));
  assert.ok(res.startsWith('\n<i>🔖'));
});

test('renderPeriodTemplate replaces {s}, {f}, {h}', () => {
  const tpl = '▪️<b><i>{s} - {f} ({h} год.)</i></b>';
  const res = renderPeriodTemplate(tpl, { start: '00:00', end: '04:00', hours: 4 }, '0');
  assert.equal(res, '▪️<b><i>00:00 - 04:00 (4 год.)</i></b>');
});

test('buildFullTelegramText generates expected output for outage day and empty day', () => {
  const intervals = [
    { start: '00:00', end: '04:00', hours: 4 },
    { start: '07:30', end: '16:00', hours: 8.5 },
  ];

  const full = buildFullTelegramText({
    headerTemplate: '🔖 Графік на {dd}:',
    periodTemplate: '▪️{s} - {f} ({h}г)',
    emptyTemplate: '-відключень не заплановано',
    hasOutages: true,
    intervals,
    ctx: DEFAULT_CONTEXT_TODAY,
  });

  assert.ok(full.includes('🔖 Графік на сьогодні:'));
  assert.ok(full.includes('▪️00:00 - 04:00 (4г)'));
  assert.ok(full.includes('▪️07:30 - 16:00 (8.5г)'));

  const emptyResult = buildFullTelegramText({
    headerTemplate: '🔖 Графік на {dd}:',
    periodTemplate: '▪️{s} - {f} ({h}г)',
    emptyTemplate: '<b>-відключень не заплановано</b>',
    hasOutages: false,
    intervals: [],
    ctx: DEFAULT_CONTEXT_TODAY,
  });

  assert.ok(emptyResult.includes('<b>-відключень не заплановано</b>'));
});

test('parseTelegramHtml identifies tags and text', () => {
  const tokens = parseTelegramHtml('▪️<b><i>00:00</i></b>');
  assert.equal(tokens[0].content, '▪️');
  assert.equal(tokens[1].tag, 'b');
  assert.equal(tokens[1].isClosing, false);
  assert.equal(tokens[2].tag, 'i');
  assert.equal(tokens[3].content, '00:00');
  assert.equal(tokens[4].tag, 'i');
  assert.equal(tokens[4].isClosing, true);
  assert.equal(tokens[5].tag, 'b');
  assert.equal(tokens[5].isClosing, true);
});
