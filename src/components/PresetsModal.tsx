import React from 'react';
import { TEMPLATE_PRESETS } from '../data/presets.ts';
import { Preset } from '../types/index.ts';
import { TelegramHtmlView } from './TelegramHtmlView.tsx';
import { X, Sparkles, Check } from 'lucide-react';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: Preset) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Готові стилі та пресети графіків
              </h2>
              <p className="text-xs text-slate-400">
                Оберіть готовий шаблон або візьміть його за основу для власних налаштувань
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEMPLATE_PRESETS.map((preset) => (
              <div
                key={preset.id}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-xl p-4 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="font-semibold text-white text-sm group-hover:text-amber-300 transition-colors">
                      {preset.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{preset.description}</p>

                  {/* Sample mini preview */}
                  <div className="bg-[#18222d] border border-[#243343] rounded-lg p-3 text-xs text-[#f5f5f5] mb-4 space-y-1">
                    <TelegramHtmlView
                      html={preset.headerTemplate
                        .replace('{dd}', 'сьогодні')
                        .replace('{d}', '15.03.2026')
                        .replace('{dm}', '15.03')
                        .replace('{fdw}', 'Неділя')
                        .replace('{sdw}', 'Нд')}
                    />
                    <div className="pt-1">
                      <TelegramHtmlView
                        html={preset.periodTemplate
                          .replace('{s}', '00:00')
                          .replace('{f}', '04:00')
                          .replace('{h}', '4')}
                      />
                    </div>
                    <div>
                      <TelegramHtmlView
                        html={preset.periodTemplate
                          .replace('{s}', '07:30')
                          .replace('{f}', '16:00')
                          .replace('{h}', '8.5')}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectPreset(preset);
                    onClose();
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Застосувати цей стиль</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
