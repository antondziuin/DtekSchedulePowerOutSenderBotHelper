import type { LeadingSymbolMode, OutageInterval } from '../types/index.ts';

export interface FormatContext {
  dayType: 'today' | 'tomorrow';
  dateStr?: string; // default e.g. "15.03.2026"
  dateNoYear?: string; // e.g. "15.03"
  dayWord?: string; // e.g. "сьогодні" or "завтра"
  fullDayOfWeek?: string; // e.g. "Неділя"
  shortDayOfWeek?: string; // e.g. "Нд"
  leadingZero?: LeadingSymbolMode;
  groupName?: string; // e.g. "2.2"
}

export const DEFAULT_CONTEXT_TODAY: FormatContext = {
  dayType: 'today',
  dateStr: '15.03.2026',
  dateNoYear: '15.03',
  dayWord: 'сьогодні',
  fullDayOfWeek: 'Неділя',
  shortDayOfWeek: 'Нд',
  leadingZero: '0',
  groupName: '2.2',
};

export const DEFAULT_CONTEXT_TOMORROW: FormatContext = {
  dayType: 'tomorrow',
  dateStr: '16.03.2026',
  dateNoYear: '16.03',
  dayWord: 'завтра',
  fullDayOfWeek: 'Понеділок',
  shortDayOfWeek: 'Пн',
  leadingZero: '0',
  groupName: '2.2',
};

/**
 * Replaces leading zero if ls is '_'
 * e.g., "09:00" -> "9:00", but "00:00" stays "00:00" or becomes "0:00"
 */
export function formatTimeWithLeading(timeStr: string, mode: LeadingSymbolMode): string {
  if (mode === '0') {
    return timeStr;
  }
  // Remove leading 0 if hours < 10
  if (/^0[0-9]:/.test(timeStr)) {
    return timeStr.slice(1);
  }
  return timeStr;
}

/**
 * Replaces header template variables:
 * {d}, {dm}, {dd}, {fdw}, {sdw}, {group}, {g}, <br>
 */
export function renderHeaderTemplate(template: string, ctx: FormatContext): string {
  if (!template) return '';
  return template
    .replace(/\{d\}/g, ctx.dateStr || '15.03.2026')
    .replace(/\{dm\}/g, ctx.dateNoYear || '15.03')
    .replace(/\{dd\}/g, ctx.dayWord || 'сьогодні')
    .replace(/\{fdw\}/g, ctx.fullDayOfWeek || 'Неділя')
    .replace(/\{sdw\}/g, ctx.shortDayOfWeek || 'Нд')
    .replace(/\{group\}/g, ctx.groupName || '2.2')
    .replace(/\{g\}/g, ctx.groupName || '2.2')
    .replace(/<br\s*\/?>/gi, '\n');
}

/**
 * Replaces period template variables:
 * {s}, {f}, {h}
 */
export function renderPeriodTemplate(
  template: string,
  interval: OutageInterval,
  mode: LeadingSymbolMode = '0'
): string {
  if (!template) return '';
  const start = formatTimeWithLeading(interval.start, mode);
  const end = formatTimeWithLeading(interval.end, mode);
  const hours = interval.hours.toString();

  return template
    .replace(/\{s\}/g, start)
    .replace(/\{f\}/g, end)
    .replace(/\{h\}/g, hours)
    .replace(/<br\s*\/?>/gi, '\n');
}

/**
 * Builds full message caption text as it will appear in Telegram
 */
export function buildFullTelegramText(options: {
  headerTemplate: string;
  periodTemplate: string;
  emptyTemplate: string;
  hasOutages: boolean;
  intervals: OutageInterval[];
  ctx: FormatContext;
  picOnly?: boolean;
}): string {
  if (options.picOnly) {
    return '*(Тільки зображення: текстовий підпис вимкнено через +piconly)*';
  }

  const renderedHeader = renderHeaderTemplate(options.headerTemplate, options.ctx).trim();

  if (!options.hasOutages || options.intervals.length === 0) {
    const renderedEmpty = (options.emptyTemplate || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .trim();
    if (!renderedHeader) return renderedEmpty;
    return `${renderedHeader}\n${renderedEmpty}`;
  }

  const renderedPeriods = options.intervals
    .map((int) => renderPeriodTemplate(options.periodTemplate, int, options.ctx.leadingZero || '0'))
    .join('\n');

  if (!renderedHeader) return renderedPeriods;
  return `${renderedHeader}\n${renderedPeriods}`;
}

export interface HtmlToken {
  type: 'text' | 'tag';
  content: string;
  tag?: string;
  isClosing?: boolean;
}

/**
 * Tokenizes Telegram HTML string with allowed tags:
 * <b>, <strong>, <i>, <em>, <u>, <s>, <strike>, <code>, <pre>, <a>
 */
export function parseTelegramHtml(raw: string): HtmlToken[] {
  const tokens: HtmlToken[] = [];
  const tagRegex = /<\/?([a-zA-Z0-9]+)(?:\s+[^>]*)?>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: 'text',
        content: raw.slice(lastIndex, match.index),
      });
    }
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    const isClosing = fullTag.startsWith('</');
    tokens.push({
      type: 'tag',
      content: fullTag,
      tag: tagName,
      isClosing,
    });
    lastIndex = match.index + fullTag.length;
  }

  if (lastIndex < raw.length) {
    tokens.push({
      type: 'text',
      content: raw.slice(lastIndex),
    });
  }

  return tokens;
}
