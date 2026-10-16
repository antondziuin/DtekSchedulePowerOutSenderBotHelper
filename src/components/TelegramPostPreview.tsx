import React, { useState } from 'react';
import { BotConfig, OutageInterval } from '../types/index.ts';
import {
  DEFAULT_CONTEXT_TODAY,
  DEFAULT_CONTEXT_TOMORROW,
  buildFullTelegramText,
} from '../utils/telegramFormatter.ts';
import { TelegramHtmlView } from './TelegramHtmlView.tsx';
import { DtekScheduleCard } from './DtekScheduleCard.tsx';
import {
  Sun,
  Moon,
  Eye,
  Plus,
  Trash2,
  Clock,
  Zap,
  Calendar,
  Share2,
  CheckCheck,
  Layers,
} from 'lucide-react';

interface TelegramPostPreviewProps {
  config: BotConfig;
  regionName: string;
}

export const TelegramPostPreview: React.FC<TelegramPostPreviewProps> = ({ config, regionName }) => {
  const [telegramTheme, setTelegramTheme] = useState<'dark' | 'light'>('dark');
  const [previewDay, setPreviewDay] = useState<'today' | 'tomorrow' | 'both'>('both');
  const [simulateEmpty, setSimulateEmpty] = useState<boolean>(false);
  const [showTwoDaysInCard, setShowTwoDaysInCard] = useState<boolean>(true);
  const [testIntervals, setTestIntervals] = useState<OutageInterval[]>([
    { start: '06:00', end: '12:00', hours: 6 },
    { start: '15:30', end: '19:00', hours: 3.5 },
  ]);

  const ctx = previewDay === 'tomorrow' ? DEFAULT_CONTEXT_TOMORROW : DEFAULT_CONTEXT_TODAY;
  const ctxWithMode = { ...ctx, leadingZero: config.leadingZero, groupName: config.group || '2.2' };

  let fullCaption = '';
  if (previewDay === 'both') {
    if (simulateEmpty) {
      fullCaption = buildFullTelegramText({
        headerTemplate: config.headerTemplate,
        periodTemplate: config.periodTemplate,
        emptyTemplate: config.emptyTemplate,
        hasOutages: false,
        intervals: [],
        ctx: { ...DEFAULT_CONTEXT_TODAY, leadingZero: config.leadingZero, groupName: config.group || '2.2' },
        picOnly: config.picOnly,
      });
    } else {
      const cap1 = buildFullTelegramText({
        headerTemplate: config.headerTemplate,
        periodTemplate: config.periodTemplate,
        emptyTemplate: config.emptyTemplate,
        hasOutages: false,
        intervals: [],
        ctx: { ...DEFAULT_CONTEXT_TODAY, leadingZero: config.leadingZero, groupName: config.group || '2.2' },
        picOnly: config.picOnly,
      });
      const cap2 = buildFullTelegramText({
        headerTemplate: config.headerTemplate,
        periodTemplate: config.periodTemplate,
        emptyTemplate: config.emptyTemplate,
        hasOutages: true,
        intervals: testIntervals,
        ctx: { ...DEFAULT_CONTEXT_TOMORROW, leadingZero: config.leadingZero, groupName: config.group || '2.2' },
        picOnly: config.picOnly,
      });
      fullCaption = `${cap1}\n${cap2}`;
    }
  } else {
    fullCaption = buildFullTelegramText({
      headerTemplate: config.headerTemplate,
      periodTemplate: config.periodTemplate,
      emptyTemplate: config.emptyTemplate,
      hasOutages: !simulateEmpty,
      intervals: testIntervals,
      ctx: ctxWithMode,
      picOnly: config.picOnly,
    });
  }

  const totalHours = simulateEmpty
    ? 0
    : testIntervals.reduce((sum, int) => sum + (Number(int.hours) || 0), 0);

  const addInterval = () => {
    setTestIntervals([
      ...testIntervals,
      { start: '19:00', end: '22:00', hours: 3 },
    ]);
  };

  const removeInterval = (index: number) => {
    setTestIntervals(testIntervals.filter((_, i) => i !== index));
  };

  const updateInterval = (index: number, field: keyof OutageInterval, value: string | number) => {
    const updated = [...testIntervals];
    updated[index] = { ...updated[index], [field]: value };
    setTestIntervals(updated);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Top Header of Preview Panel */}
      <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-sm text-white">Live-перегляд Telegram</span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            (як виглядатиме повідомлення в каналі)
          </span>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Day toggle */}
          <div className="bg-slate-900 p-0.5 rounded-lg border border-slate-700 flex text-xs">
            <button
              type="button"
              onClick={() => setPreviewDay('both')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                previewDay === 'both'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Обидва дні (Сьогодні + Завтра)
            </button>
            <button
              type="button"
              onClick={() => setPreviewDay('today')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                previewDay === 'today'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Сьогодні
            </button>
            <button
              type="button"
              onClick={() => setPreviewDay('tomorrow')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                previewDay === 'tomorrow'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Завтра
            </button>
          </div>

          {/* Outage status toggle */}
          <button
            type="button"
            onClick={() => setSimulateEmpty(!simulateEmpty)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              simulateEmpty
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}
          >
            {simulateEmpty ? '✅ Без відключень' : '⚡ Є відключення'}
          </button>

          {/* Toggle 1 day vs 2 days in the image card */}
          <button
            type="button"
            onClick={() => setShowTwoDaysInCard(!showTwoDaysInCard)}
            title="Перемкнути 1 або 2 дні в таблиці зображення"
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
              showTwoDaysInCard
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>{showTwoDaysInCard ? '2 дні на фото' : '1 день на фото'}</span>
          </button>

          {/* Theme switcher */}
          <button
            type="button"
            onClick={() => setTelegramTheme(telegramTheme === 'dark' ? 'light' : 'dark')}
            title="Перемкнути тему Telegram"
            className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            {telegramTheme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Telegram App Environment Container */}
      <div
        className={`flex-1 p-3 sm:p-5 overflow-y-auto transition-colors ${
          telegramTheme === 'dark'
            ? 'bg-[#0f141c] text-[#e1e3e6]'
            : 'bg-[#98b0c2]/30 text-[#17212b]'
        }`}
        style={{
          backgroundImage:
            telegramTheme === 'dark'
              ? 'radial-gradient(#1c2738 1px, transparent 1px)'
              : 'radial-gradient(#7c98ad44 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        <div className="max-w-xl mx-auto">
          {/* Telegram Channel Message Bubble */}
          <div
            className={`rounded-2xl p-3 sm:p-4 shadow-lg border transition-all ${
              telegramTheme === 'dark'
                ? 'bg-[#18222d] border-[#243343] text-[#f5f5f5]'
                : 'bg-white border-[#d3dbe3] text-[#111111]'
            }`}
          >
            {/* Message Header matching the user screenshot exactly */}
            <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-white/10 dark:border-white/5">
              <span className="text-sm sm:text-base font-bold text-[#4ade80]">
                СвітлоБот
              </span>
              <span className="text-amber-400 font-bold text-base">⚡</span>
              <span className="text-sm sm:text-base font-bold text-[#4ade80] truncate">
                {config.channelTitle || 'Провулок Артилерійський 5Б'}
              </span>
            </div>

            {/* Authentic DTEK Schedule Graphic Image Attachment */}
            <div className="mb-3 rounded-xl overflow-hidden shadow-sm">
              <DtekScheduleCard
                regionName={regionName}
                groupName={config.group || '2.2'}
                intervalsToday={
                  previewDay === 'both'
                    ? []
                    : previewDay === 'today' && !simulateEmpty
                    ? testIntervals
                    : []
                }
                intervalsTomorrow={
                  simulateEmpty
                    ? []
                    : previewDay === 'today'
                    ? []
                    : testIntervals
                }
                showTwoDays={showTwoDaysInCard}
                isEmptyToday={simulateEmpty || (previewDay === 'both')}
              />
            </div>

            {/* Rendered Caption below image */}
            <div className="text-xs sm:text-sm font-sans pt-1">
              <TelegramHtmlView html={fullCaption} />
            </div>

            {/* Telegram Message Footer (Views count & Time matching screenshot) */}
            <div className="mt-2.5 pt-1 flex items-center justify-end gap-2 text-[11px] opacity-70 font-sans">
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 opacity-80" />
                <span>41</span>
              </div>
              <span>8:13 PM</span>
            </div>
          </div>

          {/* Interactive Interval Adjuster Panel for testing templates */}
          <div className="mt-4 p-3.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-300">
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Тестові години знеструмлення (для симуляції):
              </span>
              <button
                type="button"
                onClick={addInterval}
                className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium flex items-center gap-1 text-[11px] transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Додати слот</span>
              </button>
            </div>

            {simulateEmpty ? (
              <p className="text-slate-400 italic text-[11px]">
                Зараз увімкнено симуляцію дня без відключень. Щоб редагувати періоди, увімкніть &ldquo;⚡ Є відключення&rdquo; вгорі.
              </p>
            ) : (
              <div className="space-y-2">
                {testIntervals.map((interval, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-slate-900/90 p-2 rounded-lg border border-slate-700/50"
                  >
                    <span className="text-slate-400 text-[10px] w-4">{idx + 1}.</span>
                    <input
                      type="text"
                      value={interval.start}
                      onChange={(e) => updateInterval(idx, 'start', e.target.value)}
                      placeholder="00:00"
                      className="w-16 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-center text-white font-mono text-xs"
                    />
                    <span className="text-slate-400">-</span>
                    <input
                      type="text"
                      value={interval.end}
                      onChange={(e) => updateInterval(idx, 'end', e.target.value)}
                      placeholder="04:00"
                      className="w-16 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-center text-white font-mono text-xs"
                    />
                    <span className="text-slate-400 text-[11px] ml-1">Трив:</span>
                    <input
                      type="number"
                      step="0.5"
                      value={interval.hours}
                      onChange={(e) => updateInterval(idx, 'hours', parseFloat(e.target.value) || 0)}
                      className="w-12 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-center text-white font-mono text-xs"
                    />
                    <span className="text-slate-400 text-[11px]">год</span>
                    {testIntervals.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInterval(idx)}
                        className="ml-auto p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Видалити"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
