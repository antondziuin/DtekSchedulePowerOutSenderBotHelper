import React from 'react';
import { Zap, HelpCircle, ExternalLink, Sparkles, SlidersHorizontal, Wand2, MapPin } from 'lucide-react';

interface HeaderProps {
  mode: 'wizard' | 'advanced';
  onModeToggle: (newMode: 'wizard' | 'advanced') => void;
  onOpenHelp: () => void;
  onOpenPresets: () => void;
  onOpenKyivFinder: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeToggle,
  onOpenHelp,
  onOpenPresets,
  onOpenKyivFinder,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white px-4 sm:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 font-black">
            <Zap className="w-5 h-5 fill-slate-950 stroke-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Конструктор графіків ДТЕК & СвітлоБот
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                v2026 Ready
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Генератор розмітки та конфігурацій для бота{' '}
              <a
                href="https://t.me/DtekSchedulePowerOutSenderBot"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:underline font-mono inline-flex items-center gap-0.5"
              >
                @DtekSchedulePowerOutSenderBot
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </p>
          </div>
        </div>

        {/* Center/Right Controls: Mode Switcher & Actions */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Mode Switcher Pill */}
          <div className="bg-slate-950 border border-slate-800 p-1 rounded-xl flex items-center shadow-inner">
            <button
              type="button"
              onClick={() => onModeToggle('wizard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                mode === 'wizard'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Візард (Простий)</span>
            </button>
            <button
              type="button"
              onClick={() => onModeToggle('advanced')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                mode === 'advanced'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Повний редактор</span>
            </button>
          </div>

          {/* Kyiv Group Finder Button */}
          <button
            type="button"
            onClick={onOpenKyivFinder}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 rounded-lg transition-colors cursor-pointer shadow-sm"
            title="Отримати номер групи для Києва за адресою із порталу YASNO"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Черга для Києва</span>
            <span className="sm:hidden">Київ YASNO</span>
          </button>

          <button
            type="button"
            onClick={onOpenPresets}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Шаблони</span>
          </button>

          <button
            type="button"
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Інструкція</span>
          </button>
        </div>
      </div>
    </header>
  );
};

