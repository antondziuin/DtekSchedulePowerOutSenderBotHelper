import React, { useState } from 'react';
import { BotConfig, Preset, SstMode } from '../types/index.ts';
import { UKRAINE_REGIONS } from '../data/regions.ts';
import { TEMPLATE_PRESETS } from '../data/presets.ts';
import { generateBotCommands, normalizeTargetId } from '../utils/commandGenerator.ts';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  Send,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Clock,
  Key,
  Layers,
  HelpCircle,
  AlertCircle,
  Hash,
  SlidersHorizontal,
  Flame,
  FileCode,
  RotateCcw,
  Search,
  AlertTriangle,
} from 'lucide-react';

interface WizardModeProps {
  config: BotConfig;
  onChange: (newConfig: BotConfig) => void;
  currentStep: number;
  onStepChange: (step: number) => void;
  onSwitchToAdvanced: () => void;
  onOpenHelp: () => void;
  onOpenKyivFinder: () => void;
  onReset: () => void;
}

const WIZARD_STEPS = [
  { step: 1, title: 'Канал / Тест', desc: 'Куди надсилати графіки' },
  { step: 2, title: 'Регіон & Черга', desc: 'Де діють відключення' },
  { step: 3, title: 'Стиль поста', desc: 'Вигляд та шаблони' },
  { step: 4, title: 'СвітлоБот & Опції', desc: 'Сенсор та розклад' },
  { step: 5, title: 'Готові команди', desc: 'Підключення бота' },
];

export const WizardMode: React.FC<WizardModeProps> = ({
  config,
  onChange,
  currentStep,
  onStepChange,
  onSwitchToAdvanced,
  onOpenHelp,
  onOpenKyivFinder,
  onReset,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [kyivGroupSearch, setKyivGroupSearch] = useState('');
  const [kyivRangeTab, setKyivRangeTab] = useState<'all' | '1-15' | '16-30' | '31-45' | '46-60'>('all');

  const selectedRegion = UKRAINE_REGIONS.find((r) => r.code === config.region) || UKRAINE_REGIONS[0];
  const generatedCommands = generateBotCommands(config);

  const update = <K extends keyof BotConfig>(field: K, value: BotConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  const handleCopySingle = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyAll = () => {
    const fullText = generatedCommands.map((c) => c.command).join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const applyPreset = (preset: Preset) => {
    onChange({
      ...config,
      headerTemplate: preset.headerTemplate,
      periodTemplate: preset.periodTemplate,
      emptyTemplate: preset.emptyTemplate,
      leadingZero: preset.leadingZero,
      delOld: preset.delOld,
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
      {/* Top Header / Mode Indicator */}
      <div className="bg-slate-950/60 border-b border-slate-800/80 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm">
            🧙‍♂️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-amber-400">
                Покроковий майстер
              </span>
              <span className="text-[11px] bg-slate-800 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Збережено автоматично
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Крок {currentStep} з {WIZARD_STEPS.length}: {WIZARD_STEPS[currentStep - 1]?.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSwitchToAdvanced}
            className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Перейти до повного редактора всіх параметрів"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Повний редактор</span>
            <span className="sm:hidden">Експерт</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="text-xs text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            title="Скинути налаштування до стандартних"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar & Stepper */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-3 sm:px-6 py-3">
        {/* Progress track */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
          <div
            className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / WIZARD_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Step buttons */}
        <div className="grid grid-cols-5 gap-1 sm:gap-2">
          {WIZARD_STEPS.map((s) => {
            const isActive = s.step === currentStep;
            const isCompleted = s.step < currentStep;

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => onStepChange(s.step)}
                className={`flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-xl text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300'
                    : isCompleted
                    ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    : 'text-slate-500 hover:text-slate-400 hover:bg-slate-800/40'
                }`}
              >
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : s.step}
                </div>
                <div className="hidden sm:block overflow-hidden">
                  <div className="text-xs font-semibold truncate leading-tight">{s.title}</div>
                  <div className="text-[10px] text-slate-400 truncate hidden md:block">
                    {s.desc}
                  </div>
                </div>
                <div className="sm:hidden text-[9px] font-medium truncate text-center">
                  {s.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content Body */}
      <div className="p-4 sm:p-6 flex-1">
        {/* STEP 1: Канал або Тест */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Куди бот має публікувати графік?</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Ви можете безпечно протестувати команди у приватних повідомленнях або відразу
                налаштувати для власного каналу.
              </p>
            </div>

            {/* Test Mode vs Channel Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => update('isTestMode', true)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  config.isTestMode
                    ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 text-white'
                    : 'bg-slate-850/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
                    🧪
                  </div>
                  {config.isTestMode && (
                    <span className="text-xs bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                      Обрано
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    Режим тестування (this)
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Надсилає графіки прямо вам у приватні повідомлення з ботом. Жодного ризику
                    випадкового спаму в канал.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => update('isTestMode', false)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  !config.isTestMode
                    ? 'bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/30 text-white'
                    : 'bg-slate-850/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
                    📢
                  </div>
                  {!config.isTestMode && (
                    <span className="text-xs bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                      Обрано
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    Telegram-канал або група
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Публікація розкладів безпосередньо у ваш канал мешканців чи сусідів.
                  </p>
                </div>
              </button>
            </div>

            {/* If Channel chosen, show inputs */}
            {!config.isTestMode && (
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-amber-400" />
                      <span>ID вашого Telegram-каналу:</span>
                    </label>
                    <button
                      type="button"
                      onClick={onOpenHelp}
                      className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <HelpCircle className="w-3 h-3" />
                      <span>Як дізнатися ID?</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={config.channelId}
                    onChange={(e) => update('channelId', e.target.value.trim())}
                    placeholder="-1001234567890"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm placeholder:text-slate-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-400">
                    ID каналу зазвичай починається з <code className="text-amber-400 font-mono">-100</code> (наприклад,{' '}
                    <code className="text-slate-300 font-mono">-1002345678901</code>). Якщо ви введете без мінуса, бот додасть його автоматично.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold">⚡</span>
                    <span>Назва будинку або каналу (для прев&apos;ю):</span>
                  </label>
                  <input
                    type="text"
                    value={config.channelTitle || ''}
                    onChange={(e) => update('channelTitle', e.target.value)}
                    placeholder="Наприклад: ЖК Комфорт Таун або Провулок Артилерійський 5Б"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder:text-slate-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-400">
                    Відображається в заголовку картки в прев&apos;ю, як на офіційних фотографіях
                    СвітлоБота.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Регіон та Група */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Оберіть регіон та вашу групу відключень</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Бот підключається до офіційних серверів оператора та стежить за змінами для вашої
                черги.
              </p>
            </div>

            {/* Region Grid */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Регіон (область / місто):</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {UKRAINE_REGIONS.map((reg) => {
                  const isSelected = config.region === reg.code;
                  return (
                    <button
                      key={reg.code}
                      type="button"
                      onClick={() => {
                        const newGroup = reg.defaultGroups.includes(config.group)
                          ? config.group
                          : (reg.defaultGroups[0] || '1.1');
                        onChange({
                          ...config,
                          region: reg.code,
                          group: newGroup,
                        });
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-sm'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="font-semibold text-xs sm:text-sm text-white truncate">
                          {reg.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{reg.provider}</div>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded uppercase">
                        {reg.code}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kyiv Address Finder Promo Banner */}
            {config.region === 'k' && (
              <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-amber-950/40 border border-emerald-500/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span>Знайти чергу за адресою у Києві (YASNO)</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Введіть вашу вулицю та номер будинку — система автоматично знайде точну чергу серед усіх 60 груп Києва через API YASNO.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenKyivFinder}
                  className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Знайти за адресою</span>
                </button>
              </div>
            )}

            {/* Group Picker */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Група / черга відключень для {selectedRegion.name}
                    {config.region === 'k' ? ' (60 груп):' : ':'}
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                    Обрано: {config.group}
                  </span>
                  {config.region === 'k' && (
                    <button
                      type="button"
                      onClick={onOpenKyivFinder}
                      className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Search className="w-3 h-3" />
                      <span>Пошук за адресою</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Special Controls for Kyiv's 60 Groups */}
              {config.region === 'k' ? (
                <div className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                    {/* Range Tabs */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto">
                      {(
                        [
                          { id: 'all', label: 'Всі (60)' },
                          { id: '1-15', label: '1–15' },
                          { id: '16-30', label: '16–30' },
                          { id: '31-45', label: '31–45' },
                          { id: '46-60', label: '46–60' },
                        ] as const
                      ).map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setKyivRangeTab(tab.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                            kyivRangeTab === tab.id
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Filter search */}
                    <div className="relative">
                      <input
                        type="text"
                        value={kyivGroupSearch}
                        onChange={(e) => setKyivGroupSearch(e.target.value)}
                        placeholder="Швидкий фільтр (напр. 20)..."
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-600 outline-none focus:border-amber-500 w-full sm:w-44"
                      />
                    </div>
                  </div>

                  {/* 60 Groups Grid */}
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5 max-h-48 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    {selectedRegion.defaultGroups
                      .filter((grp) => {
                        const num = parseInt(grp.split('.')[0] || '0', 10);
                        if (kyivRangeTab === '1-15' && (num < 1 || num > 15)) return false;
                        if (kyivRangeTab === '16-30' && (num < 16 || num > 30)) return false;
                        if (kyivRangeTab === '31-45' && (num < 31 || num > 45)) return false;
                        if (kyivRangeTab === '46-60' && (num < 46 || num > 60)) return false;
                        if (kyivGroupSearch.trim()) {
                          return grp.includes(kyivGroupSearch.trim());
                        }
                        return true;
                      })
                      .map((grp) => {
                        const isGrpSelected = config.group === grp;
                        return (
                          <button
                            key={grp}
                            type="button"
                            onClick={() => update('group', grp)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                              isGrpSelected
                                ? 'bg-amber-500 text-slate-950 shadow-md scale-105 font-bold ring-2 ring-amber-400'
                                : 'bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300'
                            }`}
                          >
                            {grp}
                          </button>
                        );
                      })}
                  </div>
                </div>
              ) : (
                /* Non-Kyiv Standard Regions */
                <div className="flex flex-wrap gap-2">
                  {selectedRegion.defaultGroups.map((grp) => {
                    const isGrpSelected = config.group === grp;
                    return (
                      <button
                        key={grp}
                        type="button"
                        onClick={() => update('group', grp)}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                          isGrpSelected
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 scale-105 font-bold'
                            : 'bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        Група {grp}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Direct Group Input (in case user has custom subgroup like 20.2 or 4.2) */}
              <div className="flex items-center gap-2 pt-2 text-xs text-slate-400">
                <span>Або введіть номер черги точно:</span>
                <input
                  type="text"
                  value={config.group}
                  onChange={(e) => update('group', e.target.value.trim())}
                  placeholder="напр. 20.1"
                  className="bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg px-2.5 py-1 text-white font-mono text-xs w-28 outline-none"
                />
              </div>

              <p className="text-[11px] text-slate-400">
                Дізнатися свою групу можна на офіційному порталі {selectedRegion.provider} за вашою адресою
                {config.region === 'k' && ' або скористатися кнопкою «Знайти за адресою» вище'}.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Стиль та Шаблон */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Як має виглядати пост у Telegram?</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Оберіть готовий перевірений стиль. Зміни відразу відображаються у вікні перегляду
                праворуч!
              </p>
            </div>

            {/* Preset Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[560px] overflow-y-auto pr-1">
              {TEMPLATE_PRESETS.map((preset) => {
                const isSelected =
                  config.headerTemplate === preset.headerTemplate &&
                  config.periodTemplate === preset.periodTemplate;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30 text-white'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-xs sm:text-sm text-white">
                          {preset.name}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                            Активний
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {preset.description}
                      </p>
                    </div>

                    <div className="bg-slate-900/90 rounded-lg p-2 font-mono text-[10px] text-amber-300/90 border border-slate-800 truncate">
                      {preset.headerTemplate}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick formatting options */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3.5">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Швидкі налаштування формату:
              </h4>

              {/* DelOld switch */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <span>Автоматично видаляти попередні графіки (+delold)</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-medium">
                      Рекомендовано
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Бот видалить старе повідомлення розкладу, коли надішле нове, щоб не засмічувати
                    канал.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={config.delOld}
                    onChange={(e) => update('delOld', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* PicOnly switch */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                <div>
                  <div className="text-xs font-semibold text-white">
                    Тільки картинка графіка (+piconly)
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Публікувати виключно картинку-таблицю без текстового списку годин.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={config.picOnly}
                    onChange={(e) => update('picOnly', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* Leading zero choice */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                <div>
                  <div className="text-xs font-semibold text-white">Формат годин (ls)</div>
                  <p className="text-[11px] text-slate-400">
                    {config.leadingZero === '0'
                      ? 'З провідним нулем (наприклад: 09:00 - 13:00)'
                      : 'Без провідного нуля (наприклад: 9:00 - 13:00)'}
                  </p>
                </div>
                <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => update('leadingZero', '_')}
                    className={`px-2.5 py-1 text-xs rounded-md transition-colors font-mono cursor-pointer ${
                      config.leadingZero === '_'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    9:00 (_)
                  </button>
                  <button
                    type="button"
                    onClick={() => update('leadingZero', '0')}
                    className={`px-2.5 py-1 text-xs rounded-md transition-colors font-mono cursor-pointer ${
                      config.leadingZero === '0'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    09:00 (0)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: СвітлоБот & Опції */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>СвітлоБот та поведінка графіка</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Додаткові функції для інтеграції з датчиком світла та розкладом на завтра.
              </p>
            </div>

            {/* Svitlobot Key Card */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      Ключ СвітлоБот (Опціонально)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Синхронізує фактичний стан світла (Є / Немає) з вашим роутером.
                    </p>
                  </div>
                </div>
                {config.svitlobotKey && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Підключено
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <input
                  type="text"
                  value={config.svitlobotKey}
                  onChange={(e) => update('svitlobotKey', e.target.value.trim().toUpperCase())}
                  placeholder="Введіть 10-значний ключ (наприклад, AAABBBCCCD) або залиште порожнім"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm placeholder:text-slate-600 outline-none uppercase"
                />
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    Отримати ключ можна у боті СвітлоБота в розділі налаштувань вашого роутера.
                  </span>
                  {config.svitlobotKey && (
                    <button
                      type="button"
                      onClick={() => update('svitlobotKey', '')}
                      className="text-slate-400 hover:text-rose-400 underline cursor-pointer"
                    >
                      Очистити
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Empty Schedule Handling */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    Коли відключень немає (порожній день)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Текст, який відображається в пості, коли енергосистема працює без обмежень.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={config.enableEmptySchedule}
                    onChange={(e) => update('enableEmptySchedule', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {config.enableEmptySchedule && (
                <input
                  type="text"
                  value={config.emptyTemplate}
                  onChange={(e) => update('emptyTemplate', e.target.value)}
                  placeholder="- інформація про планові відключення відсутня"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm placeholder:text-slate-600 outline-none"
                />
              )}
            </div>

            {/* SST (Schedule for tomorrow time) */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2.5">
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Коли надсилати графік на наступний день (sst)?</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  {
                    id: 'earlier_of_both',
                    val: 22,
                    label: 'Щойно є або о 22:00',
                    desc: 'Рекомендовано (-22)',
                  },
                  {
                    id: 'specific_time',
                    val: 20,
                    label: 'Фіксовано о 20:00',
                    desc: 'Тільки ввечері (20)',
                  },
                  {
                    id: 'disabled',
                    val: 0,
                    label: 'Вимкнено',
                    desc: 'Не публікувати завтрашній (0)',
                  },
                ].map((item) => {
                  const isSstActive = config.sstMode === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onChange({
                          ...config,
                          sstMode: item.id as SstMode,
                          sstValue: item.val,
                        });
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSstActive
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="font-semibold text-xs text-white">{item.label}</div>
                      <div className="text-[10px] text-slate-400">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Фініш! Готові команди */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Success Hero Banner */}
            <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-amber-950/40 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-2xl shadow-lg shadow-emerald-500/20 shrink-0">
                  🎉
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Всі налаштування успішно сформовані!
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Залишилося надіслати готові команди боту в Telegram.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCopyAll}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                    copiedAll
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600'
                  }`}
                  title="Скопіювати всі рядки в буфер обміну для збереження в блокнот"
                >
                  {copiedAll ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-950" />
                      <span>Скопійовано для нотаток!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Скопіювати всі (для нотаток)</span>
                    </>
                  )}
                </button>
                <span className="text-[10px] text-amber-400/90 font-medium text-center sm:text-right">
                  * у бот надсилайте тільки по черзі
                </span>
              </div>
            </div>

            {/* 3 Step Action Guide */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Як підключити за 1 хвилину:</span>
              </h4>
              <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                <li className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 space-y-1">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <span>1. Додайте бота</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {!config.isTestMode
                      ? 'Додайте @DtekSchedulePowerOutSenderBot адміністратором у канал з правом публікації.'
                      : 'У тестовому режимі канал не потрібен — надсилайте команди в особисті.'}
                  </p>
                </li>
                <li className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 space-y-1">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <span>2. Відкрийте бота</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Перейдіть до бота в Telegram{' '}
                    <a
                      href="https://t.me/DtekSchedulePowerOutSenderBot"
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-400 hover:underline inline-flex items-center font-mono"
                    >
                      @Dtek...Bot <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                    </a>
                  </p>
                </li>
                <li className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 space-y-1.5">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <span>3. Надішліть команди ТІЛЬКИ по черзі</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Скопіюйте кожну команду нижче та надсилайте боту <strong className="text-amber-300">виключно по черзі</strong> (кожну окремим повідомленням).
                  </p>
                </li>
              </ol>
            </div>

            {/* Warning banner */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5 text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-amber-300">
                  Правило введення: тільки по черзі
                </span>
                <p className="text-amber-200/80 text-[11px] leading-relaxed">
                  Натискайте кнопку «Копіювати» навпроти кожної команди по одній та надсилайте в діалог з ботом окремими повідомленнями.
                </p>
              </div>
            </div>

            {/* Generated Commands List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Ваші згенеровані команди ({generatedCommands.length}):
                </h4>
                <a
                  href="https://t.me/DtekSchedulePowerOutSenderBot"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Відкрити бота в Telegram</span>
                </a>
              </div>

              <div className="space-y-2">
                {generatedCommands.map((item) => {
                  const isCopied = copiedKey === item.key;
                  return (
                    <div
                      key={item.key}
                      className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="overflow-hidden space-y-0.5">
                        <div className="text-[11px] text-slate-400 truncate">{item.label}</div>
                        <div className="font-mono text-xs sm:text-sm text-amber-300 truncate select-all">
                          {item.command}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopySingle(item.command, item.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Скопійовано</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Копіювати</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Switch to Advanced button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
              <p className="text-xs text-slate-400">
                Потрібно вручну змінити HTML-теги або шаблон рядка?
              </p>
              <button
                type="button"
                onClick={onSwitchToAdvanced}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Відкрити повний розширений редактор →</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Wizard Footer Navigation Controls */}
      <div className="bg-slate-950/80 border-t border-slate-800 px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
        {/* Back button */}
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={() => onStepChange(currentStep - 1)}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Назад</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onSwitchToAdvanced}
            className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>До розширеного режиму</span>
          </button>
        )}

        {/* Next / Finish button */}
        {currentStep < WIZARD_STEPS.length ? (
          <button
            type="button"
            onClick={() => onStepChange(currentStep + 1)}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <span>
              Крок {currentStep + 1}: {WIZARD_STEPS[currentStep]?.title}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <a
            href="https://t.me/DtekSchedulePowerOutSenderBot"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-sky-500/20"
          >
            <Send className="w-4 h-4" />
            <span>Відкрити бота в Telegram →</span>
          </a>
        )}
      </div>
    </div>
  );
};
