import React from 'react';
import { Bold, Italic, Code, Underline, Strikethrough, CornerDownLeft } from 'lucide-react';

interface MarkupToolbarProps {
  onInsertTag: (tag: string, closingTag?: string) => void;
  onInsertVariable: (variable: string) => void;
  onInsertEmoji: (emoji: string) => void;
  availableVariables: { token: string; label: string; desc: string }[];
  showEmojis?: boolean;
}

export const MarkupToolbar: React.FC<MarkupToolbarProps> = ({
  onInsertTag,
  onInsertVariable,
  onInsertEmoji,
  availableVariables,
  showEmojis = true,
}) => {
  const commonEmojis = ['▪️', '⚡', '💡', '🔖', '🕒', '⏳', '❌', '✅', '🔴', '🟢', '🔋', '🔌', '⚠️', 'ℹ️'];

  return (
    <div className="flex flex-col gap-2 p-2 bg-slate-900/70 border border-slate-700/70 rounded-xl">
      {/* Format tags row */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-[11px] font-semibold text-slate-400 mr-1">HTML-теги:</span>
        <button
          type="button"
          onClick={() => onInsertTag('<b>', '</b>')}
          className="p-1.5 rounded hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1 transition-colors"
          title="Жирний (bold)"
        >
          <Bold className="w-3.5 h-3.5" />
          <span className="text-[10px] font-mono">&lt;b&gt;</span>
        </button>

        <button
          type="button"
          onClick={() => onInsertTag('<i>', '</i>')}
          className="p-1.5 rounded hover:bg-slate-700 text-slate-200 text-xs italic border border-slate-700 flex items-center gap-1 transition-colors"
          title="Курсив (italic)"
        >
          <Italic className="w-3.5 h-3.5" />
          <span className="text-[10px] font-mono">&lt;i&gt;</span>
        </button>

        <button
          type="button"
          onClick={() => onInsertTag('<u>', '</u>')}
          className="p-1.5 rounded hover:bg-slate-700 text-slate-200 text-xs underline border border-slate-700 flex items-center gap-1 transition-colors"
          title="Підкреслений (underline)"
        >
          <Underline className="w-3.5 h-3.5" />
          <span className="text-[10px] font-mono">&lt;u&gt;</span>
        </button>

        <button
          type="button"
          onClick={() => onInsertTag('<s>', '</s>')}
          className="p-1.5 rounded hover:bg-slate-700 text-slate-200 text-xs line-through border border-slate-700 flex items-center gap-1 transition-colors"
          title="Перекреслений (strikethrough)"
        >
          <Strikethrough className="w-3.5 h-3.5" />
          <span className="text-[10px] font-mono">&lt;s&gt;</span>
        </button>

        <button
          type="button"
          onClick={() => onInsertTag('<code>', '</code>')}
          className="p-1.5 rounded hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 flex items-center gap-1 transition-colors"
          title="Моноширинний (code)"
        >
          <Code className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] font-mono">&lt;code&gt;</span>
        </button>

        <button
          type="button"
          onClick={() => onInsertTag('<br>')}
          className="p-1.5 rounded hover:bg-slate-700 text-amber-300 text-xs font-mono border border-slate-700 flex items-center gap-1 transition-colors"
          title="Перенесення рядка"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
          <span className="text-[10px]">&lt;br&gt;</span>
        </button>
      </div>

      {/* Variables row */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800">
        <span className="text-[11px] font-semibold text-slate-400 mr-1">Вставити змінну:</span>
        {availableVariables.map((v) => (
          <button
            key={v.token}
            type="button"
            onClick={() => onInsertVariable(v.token)}
            title={v.desc}
            className="px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-mono transition-colors flex items-center gap-1"
          >
            <span className="font-bold">{v.token}</span>
            <span className="text-[10px] text-amber-200/70 font-sans hidden sm:inline">({v.label})</span>
          </button>
        ))}
      </div>

      {/* Emojis row */}
      {showEmojis && (
        <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Емодзі:</span>
          {commonEmojis.map((em) => (
            <button
              key={em}
              type="button"
              onClick={() => onInsertEmoji(em)}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-700 text-sm transition-colors"
            >
              {em}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
