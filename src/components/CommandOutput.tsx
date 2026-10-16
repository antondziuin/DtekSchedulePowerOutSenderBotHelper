import React, { useState } from 'react';
import { BotConfig } from '../types/index.ts';
import { generateBotCommands, generateManagementCommands } from '../utils/commandGenerator.ts';
import {
  Copy,
  Check,
  Send,
  AlertTriangle,
  ExternalLink,
  Trash2,
  Terminal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface CommandOutputProps {
  config: BotConfig;
}

export const CommandOutput: React.FC<CommandOutputProps> = ({ config }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showManagement, setShowManagement] = useState(false);

  const commands = generateBotCommands(config);
  const mgmt = generateManagementCommands(config);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const copyAllCommands = async () => {
    const fullText = commands.map((c) => c.command).join('\n');
    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    } catch {
      // fallback
      const textArea = document.createElement('textarea');
      textArea.value = fullText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base">Готові команди для бота</h2>
            <p className="text-xs text-slate-400">
              {config.isTestMode
                ? 'Режим тестування (команди містять "this")'
                : `Для каналу ${config.channelId || '-100XXXXXXXXXX'}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyAllCommands}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            {copiedAll ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Усі команди скопійовано!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Скопіювати всі</span>
              </>
            )}
          </button>

          <a
            href="https://t.me/DtekSchedulePowerOutSenderBot"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-sky-500/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Відкрити бота</span>
          </a>
        </div>
      </div>

      {/* Strict warning callout */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 sm:p-3.5 flex items-start gap-2.5 text-amber-200">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-0.5">
          <span className="font-bold text-amber-300">
            ВАЖЛИВО: Кожен рядок потрібно вводити ботові окремим повідомленням!
          </span>
          <p className="text-amber-200/80 leading-relaxed">
            Скопіюйте команду №1, надішліть боту{' '}
            <code className="text-white bg-black/30 px-1 py-0.5 rounded">
              @DtekSchedulePowerOutSenderBot
            </code>
            , дочекайтеся відповіді або одразу надішліть наступну окремим повідомленням.
          </p>
        </div>
      </div>

      {/* Commands List */}
      <div className="space-y-2.5">
        {commands.map((cmd, idx) => (
          <div
            key={cmd.key}
            className="bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 rounded-xl p-3 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold text-slate-400">
                  {cmd.label}
                </span>
                {cmd.isOptional && (
                  <span className="text-[9px] bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded">
                    опціонально
                  </span>
                )}
              </div>
              <div className="font-mono text-xs text-amber-300 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-900 select-all break-all overflow-x-auto">
                {cmd.command}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{cmd.description}</p>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(cmd.command, cmd.key)}
              className={`shrink-0 self-end sm:self-center px-3 py-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                copiedKey === cmd.key
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600 hover:border-slate-500'
              }`}
            >
              {copiedKey === cmd.key ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Скопійовано!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Скопіювати</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Management / Cleanup Accordion */}
      <div className="pt-2 border-t border-slate-800">
        <button
          type="button"
          onClick={() => setShowManagement(!showManagement)}
          className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 py-1 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Команди скидання та повного видалення підписки</span>
          </span>
          {showManagement ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showManagement && (
          <div className="mt-3 space-y-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs animate-in fade-in duration-150">
            <p className="text-slate-400">
              Якщо ви випадково ввели неправильний регіон або хочете відключити публікацію:
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
              <div>
                <span className="font-semibold text-rose-300 block">Видалити підписку на графіки:</span>
                <code className="text-rose-400 font-mono text-xs">{mgmt.deleteSub}</code>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(mgmt.deleteSub, 'delSub')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 text-[11px] self-start sm:self-auto cursor-pointer"
              >
                {copiedKey === 'delSub' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Скопіювати</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
              <div>
                <span className="font-semibold text-rose-300 block">Видалити ключ СвітлоБота:</span>
                <code className="text-rose-400 font-mono text-xs">{mgmt.deleteKey}</code>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(mgmt.deleteKey, 'delKey')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 text-[11px] self-start sm:self-auto cursor-pointer"
              >
                {copiedKey === 'delKey' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Скопіювати</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
