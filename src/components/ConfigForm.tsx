import React, { useRef } from 'react';
import { BotConfig, LeadingSymbolMode, SstMode } from '../types/index.ts';
import { UKRAINE_REGIONS } from '../data/regions.ts';
import { MarkupToolbar } from './MarkupToolbar.tsx';
import {
  Hash,
  MapPin,
  Users,
  Settings,
  Sparkles,
  Key,
  CalendarX2,
  AlertCircle,
  HelpCircle,
  Clock,
  Trash2,
  Search,
} from 'lucide-react';

interface ConfigFormProps {
  config: BotConfig;
  onChange: (newConfig: BotConfig) => void;
  onOpenPresets: () => void;
  onOpenHelp: () => void;
  onOpenKyivFinder?: () => void;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({
  config,
  onChange,
  onOpenPresets,
  onOpenHelp,
  onOpenKyivFinder,
}) => {
  const headerTextareaRef = useRef<HTMLTextAreaElement>(null);
  const periodTextareaRef = useRef<HTMLTextAreaElement>(null);
  const emptyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedRegionInfo = UKRAINE_REGIONS.find((r) => r.code === config.region);

  const update = <K extends keyof BotConfig>(field: K, value: BotConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  // Helper to insert tags or variables at cursor in specific textarea
  const insertIntoTextarea = (
    ref: React.RefObject<HTMLTextAreaElement | null>,
    field: 'headerTemplate' | 'periodTemplate' | 'emptyTemplate',
    prefix: string,
    suffix: string = ''
  ) => {
    const textarea = ref.current;
    if (!textarea) {
      update(field, config[field] + prefix + suffix);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = config[field];
    const selectedText = currentText.substring(start, end);

    const replacement = prefix + selectedText + suffix;
    const newText = currentText.substring(0, start) + replacement + currentText.substring(end);

    update(field, newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  // Channel ID validation notice
  const showChannelWarning =
    !config.isTestMode &&
    config.channelId &&
    !config.channelId.startsWith('-');

  return (
    <div className="space-y-6">
      {/* SECTION 1: Основні параметри каналу та черги */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h2 className="font-bold text-white text-sm sm:text-base">
              Канал, Регіон та Черга
            </h2>
          </div>
          <button
            type="button"
            onClick={onOpenHelp}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Як дізнатись ID?</span>
          </button>
        </div>

        {/* Test Mode Switcher */}
        <div className="bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🧪</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-300">
                  Режим тестування (this)
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-medium">
                  Без спаму в канал
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Використовує <code className="text-emerald-300">this</code> замість ID каналу, щоб безпечно протестувати команди в приватних повідомленнях з ботом.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={config.isTestMode}
              onChange={(e) => update('isTestMode', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Channel ID input (shown when test mode is false) */}
        {!config.isTestMode && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-amber-400" />
              <span>ID Telegram-каналу:</span>
            </label>
            <input
              type="text"
              value={config.channelId}
              onChange={(e) => update('channelId', e.target.value.trim())}
              placeholder="-1001234567890"
              className="w-full bg-slate-800/90 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2 text-white font-mono text-sm placeholder:text-slate-500 transition-all outline-none"
            />
            {showChannelWarning && (
              <div className="flex items-center gap-1.5 text-xs text-amber-400 pt-0.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Зазвичай ID каналу починається з <strong>-100</strong> (ми автоматично додамо мінус при генерації, якщо ви ввели без нього).
                </span>
              </div>
            )}
          </div>
        )}

        {/* Channel Location / Title (as seen in screenshot "СвітлоБот ⚡ Провулок Артилерійський 5Б") */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">⚡</span>
              <span>Назва каналу / адреси для прев&apos;ю:</span>
            </span>
            <span className="text-[10px] text-slate-400">відображається в заголовку поста</span>
          </label>
          <input
            type="text"
            value={config.channelTitle || ''}
            onChange={(e) => update('channelTitle', e.target.value)}
            placeholder="наприклад: Провулок Артилерійський 5Б"
            className="w-full bg-slate-800/90 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm placeholder:text-slate-500 transition-all outline-none"
          />
        </div>

        {/* Region & Queue */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Region */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 h-6">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Область / Оператор (код):</span>
            </label>
            <select
              value={config.region}
              onChange={(e) => {
                const newReg = e.target.value;
                const regInfo = UKRAINE_REGIONS.find((r) => r.code === newReg);
                const defaultGrp = regInfo && regInfo.defaultGroups[0] ? regInfo.defaultGroups[0] : '1.1';
                onChange({ ...config, region: newReg, group: defaultGrp });
              }}
              className="w-full h-10 bg-slate-800/90 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm transition-all outline-none cursor-pointer"
            >
              {UKRAINE_REGIONS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name} ({r.code}) — {r.provider}
                </option>
              ))}
            </select>
          </div>

          {/* Group / Queue */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 h-6">
              <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Черга (група відключень):</span>
            </label>
            <input
              type="text"
              value={config.group}
              onChange={(e) => update('group', e.target.value.trim())}
              placeholder="наприклад: 20.1 або 4.1"
              className="w-full h-10 bg-slate-800/90 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2 text-white font-mono text-sm transition-all outline-none"
            />
          </div>
        </div>

        {/* Quick select buttons for typical groups of this region */}
        {selectedRegionInfo && selectedRegionInfo.defaultGroups.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>
                Швидкий вибір черги
                {config.region === 'k' ? ' (у Києві 60 груп):' : ':'}
              </span>
              {config.region === 'k' && onOpenKyivFinder && (
                <button
                  type="button"
                  onClick={onOpenKyivFinder}
                  className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  title="Отримати чергу за адресою на порталі YASNO"
                >
                  <Search className="w-3 h-3" />
                  <span>Дізнатися групу будинку за адресою</span>
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-slate-900/50 rounded-xl border border-slate-800/60">
              {selectedRegionInfo.defaultGroups.map((grp) => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => update('group', grp)}
                  className={`px-2 py-0.5 rounded text-xs font-mono transition-colors cursor-pointer ${
                    config.group === grp
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Flags checkboxes */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.delOld}
              onChange={(e) => update('delOld', e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 bg-slate-800 border-slate-700 focus:ring-amber-500 cursor-pointer"
            />
            <span className="font-semibold text-white">+delold</span>
            <span className="text-slate-400">(автовидалення попереднього графіка)</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.picOnly}
              onChange={(e) => update('picOnly', e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 bg-slate-800 border-slate-700 focus:ring-amber-500 cursor-pointer"
            />
            <span className="font-semibold text-white">+piconly</span>
            <span className="text-slate-400">(тільки фото без тексту)</span>
          </label>
        </div>
      </div>

      {/* SECTION 2: Форматування та Шаблони */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h2 className="font-bold text-white text-sm sm:text-base">
              Зовнішній вигляд та Розмітка (fl / pt / ls)
            </h2>
          </div>
          <button
            type="button"
            onClick={onOpenPresets}
            className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Обрати готовий стиль</span>
          </button>
        </div>

        {/* Leading Zero Mode (ls) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Формат годин (команда ls):</span>
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => update('leadingZero', '0')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                config.leadingZero === '0'
                  ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-sm'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <div className="font-semibold text-xs text-amber-300 font-mono">ls 0 (з нулем)</div>
              <div className="text-[11px] mt-0.5">Приклад: 09:00 - 14:00</div>
            </button>

            <button
              type="button"
              onClick={() => update('leadingZero', '_')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                config.leadingZero === '_'
                  ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-sm'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <div className="font-semibold text-xs text-amber-300 font-mono">ls _ (без нуля)</div>
              <div className="text-[11px] mt-0.5">Приклад: 9:00 - 14:00</div>
            </button>
          </div>
        </div>

        {/* Header Template (fl) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Шаблон заголовка повідомлення (команда fl):</span>
            <span className="text-[11px] text-slate-400 font-mono">
              -100... {config.region} fl ...
            </span>
          </label>

          <MarkupToolbar
            onInsertTag={(open, close) =>
              insertIntoTextarea(headerTextareaRef, 'headerTemplate', open, close)
            }
            onInsertVariable={(v) =>
              insertIntoTextarea(headerTextareaRef, 'headerTemplate', v)
            }
            onInsertEmoji={(em) =>
              insertIntoTextarea(headerTextareaRef, 'headerTemplate', em)
            }
            availableVariables={[
              { token: '{dd}', label: 'сьогодні/завтра', desc: 'Слова "сьогодні" або "завтра"' },
              { token: '{d}', label: 'повна дата', desc: 'Повна дата, наприклад 15.03.2026' },
              { token: '{dm}', label: 'без року', desc: 'Дата без року, наприклад 15.03' },
              { token: '{fdw}', label: 'день повний', desc: 'День тижня (Неділя, Понеділок...)' },
              { token: '{sdw}', label: 'день скорочено', desc: 'Скорочений день (Нд, Пн...)' },
            ]}
          />

          <textarea
            ref={headerTextareaRef}
            rows={2}
            value={config.headerTemplate}
            onChange={(e) => update('headerTemplate', e.target.value)}
            placeholder="<br><i>🔖 Графік відключень <b>на {dd}, {d} ({fdw})</b>:</i>"
            className="w-full bg-slate-800/90 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl p-3 text-white font-mono text-xs sm:text-sm leading-relaxed transition-all outline-none"
          />
        </div>

        {/* Period Template (pt) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Шаблон рядка періоду відключення (команда pt):</span>
            <span className="text-[11px] text-slate-400 font-mono">
              -100... {config.region} pt ...
            </span>
          </label>

          <MarkupToolbar
            onInsertTag={(open, close) =>
              insertIntoTextarea(periodTextareaRef, 'periodTemplate', open, close)
            }
            onInsertVariable={(v) =>
              insertIntoTextarea(periodTextareaRef, 'periodTemplate', v)
            }
            onInsertEmoji={(em) =>
              insertIntoTextarea(periodTextareaRef, 'periodTemplate', em)
            }
            availableVariables={[
              { token: '{s}', label: 'початок', desc: 'Час початку відключення (00:00)' },
              { token: '{f}', label: 'кінець', desc: 'Час закінчення відключення (04:00)' },
              { token: '{h}', label: 'тривалість', desc: 'Тривалість у годинах (наприклад 4 або 8.5)' },
            ]}
          />

          <textarea
            ref={periodTextareaRef}
            rows={2}
            value={config.periodTemplate}
            onChange={(e) => update('periodTemplate', e.target.value)}
            placeholder="▪️<b><i>{s} - {f} ({h} год.)</i></b>"
            className="w-full bg-slate-800/90 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl p-3 text-white font-mono text-xs sm:text-sm leading-relaxed transition-all outline-none"
          />
        </div>
      </div>

      {/* SECTION 3: СвітлоБот Інтеграція */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h2 className="font-bold text-white text-sm sm:text-base">
              Інтеграція зі СвітлоБот (ключ key)
            </h2>
          </div>
          <span className="text-xs text-slate-400">Опціонально</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>Ключ СвітлоБота (для каналу):</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={config.svitlobotKey}
              onChange={(e) => update('svitlobotKey', e.target.value.trim())}
              placeholder="наприклад: AAABBBCCCD"
              className="flex-1 bg-slate-800/90 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2 text-white font-mono text-sm placeholder:text-slate-500 transition-all outline-none"
            />
            {config.svitlobotKey && (
              <button
                type="button"
                onClick={() => update('svitlobotKey', '')}
                className="px-3 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors"
                title="Очистити ключ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            Де дізнатися ключ: натисніть кнопку <strong>&quot;Статус&quot;</strong> у чаті з ботом{' '}
            <a
              href="https://t.me/SvitloUkraineBot"
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 hover:underline font-mono"
            >
              @SvitloUkraineBot
            </a>
            . Бот синхронізує картинки на каналі та рядок <em>&quot;очікуємо о...&quot;</em>.
          </p>
        </div>
      </div>

      {/* SECTION 4: Дії з порожніми графіками (без відключень) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
              4
            </div>
            <h2 className="font-bold text-white text-sm sm:text-base">
              Дні без відключень (команди et / sst / ec)
            </h2>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enableEmptySchedule}
              onChange={(e) => update('enableEmptySchedule', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        {config.enableEmptySchedule && (
          <div className="space-y-4 pt-1 animate-in fade-in duration-200">
            {/* Empty text (et) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Текст при відсутності відключень (команда et):</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  -100... {config.region} et ...
                </span>
              </label>

              <MarkupToolbar
                onInsertTag={(open, close) =>
                  insertIntoTextarea(emptyTextareaRef, 'emptyTemplate', open, close)
                }
                onInsertVariable={(v) =>
                  insertIntoTextarea(emptyTextareaRef, 'emptyTemplate', v)
                }
                onInsertEmoji={(em) =>
                  insertIntoTextarea(emptyTextareaRef, 'emptyTemplate', em)
                }
                availableVariables={[
                  { token: '{d}', label: 'дата', desc: 'Дата' },
                  { token: '{dd}', label: 'сьогодні/завтра', desc: 'День' },
                ]}
                showEmojis={true}
              />

              <input
                ref={emptyTextareaRef as unknown as React.RefObject<HTMLInputElement>}
                type="text"
                value={config.emptyTemplate}
                onChange={(e) => update('emptyTemplate', e.target.value)}
                placeholder="<b>-відключень не заплановано</b>"
                className="w-full bg-slate-800/90 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2 text-white font-mono text-xs sm:text-sm transition-all outline-none"
              />
            </div>

            {/* SST setting */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Час надсилання порожнього графіка на завтра (команда sst):
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Option 1: Fixed time */}
                <button
                  type="button"
                  onClick={() => update('sstMode', 'specific_time')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    config.sstMode === 'specific_time'
                      ? 'bg-amber-500/10 border-amber-500/50 text-white'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-bold text-amber-300 mb-1">
                    Фіксований час ({config.sstValue || 20}:00)
                  </div>
                  <p className="text-[11px] leading-tight text-slate-300">
                    Надіслати в зазначену годину (наприклад 20:00), якщо по вашій групі немає знеструмлень
                  </p>
                </button>

                {/* Option 2: Other groups (-1) */}
                <button
                  type="button"
                  onClick={() => update('sstMode', 'other_groups')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    config.sstMode === 'other_groups'
                      ? 'bg-amber-500/10 border-amber-500/50 text-white'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-bold text-amber-300 mb-1">sst -1 (за іншими)</div>
                  <p className="text-[11px] leading-tight text-slate-300">
                    Надіслати тільки якщо з&apos;явився розклад у будь-якій іншій групі
                  </p>
                </button>

                {/* Option 3: Earlier of both (sst -22) */}
                <button
                  type="button"
                  onClick={() => update('sstMode', 'earlier_of_both')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    config.sstMode === 'earlier_of_both'
                      ? 'bg-amber-500/10 border-amber-500/50 text-white'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-bold text-amber-300 mb-1">
                    sst -{config.sstValue || 22} (комбо)
                  </div>
                  <p className="text-[11px] leading-tight text-slate-300">
                    Або при появі в інших групах, або в {config.sstValue || 22}:00 (що настане раніше)
                  </p>
                </button>
              </div>

              {/* Hour selector for specific_time / earlier_of_both */}
              {(config.sstMode === 'specific_time' || config.sstMode === 'earlier_of_both') && (
                <div className="flex items-center gap-3 bg-slate-850 p-2.5 rounded-xl border border-slate-700/60">
                  <span className="text-xs text-slate-300">Вказана година надсилання:</span>
                  <input
                    type="number"
                    min="1"
                    max="23"
                    value={config.sstValue}
                    onChange={(e) => update('sstValue', parseInt(e.target.value, 10) || 20)}
                    className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-center text-white font-mono text-sm"
                  />
                  <span className="text-xs text-slate-400">:00</span>
                </div>
              )}
            </div>

            {/* Empty count (ec) */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Через скільки днів зупинити відправку якщо немає змін (команда ec):</span>
                <span className="text-xs font-mono text-emerald-400">
                  ec {config.ecValue}
                </span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={config.ecValue}
                  onChange={(e) => update('ecValue', parseInt(e.target.value, 10) || 1)}
                  className="flex-1 accent-amber-500 cursor-pointer"
                />
                <span className="text-xs text-slate-300 font-medium min-w-[70px]">
                  {config.ecValue} {config.ecValue === 1 ? 'день' : config.ecValue < 5 ? 'дні' : 'днів'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Запобігає надсиланню зайвих повторних повідомлень &quot;відключень немає&quot; кожного дня при стабільній ситуації в енергосистемі.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
