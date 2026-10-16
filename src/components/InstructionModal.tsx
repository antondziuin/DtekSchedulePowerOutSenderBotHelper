import React from 'react';
import { X, ShieldAlert, Key, MessageSquare, Terminal, ExternalLink, CheckCircle2 } from 'lucide-react';

interface InstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionModal: React.FC<InstructionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Повна інструкція з налаштування бота
              </h2>
              <p className="text-xs text-slate-400">
                За інструкцією від одного з дописувачів спільноти (автори бота @DtekSchedulePowerOutSenderBot: @the_route_66 та @Baskerville42)
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

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-slate-300 text-sm leading-relaxed">
          {/* Critical Warning */}
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex gap-3 text-rose-200">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-xs sm:text-sm">
              <strong className="font-semibold text-rose-300 block">
                ⚠️ Критично важливі вимоги (щоб уникнути БАНУ вашого каналу):
              </strong>
              <ul className="list-disc list-inside space-y-1 text-rose-200/90 text-xs">
                <li>
                  <strong>Права адміністратора:</strong> Ви зобов&apos;язані додати бота{' '}
                  <span className="font-mono text-white">@DtekSchedulePowerOutSenderBot</span> як
                  адміна у ваш канал з правом на <u>відправку повідомлень</u>. Доступ до інших прав не потрібен.
                </li>
                <li>
                  <strong>Окремі повідомлення:</strong> Кожну команду потрібно надсилати ботові{' '}
                  <u>окремим повідомленням</u> у приватні повідомлення (не одним суцільним текстом!).
                </li>
                <li>
                  Не копіюйте команди з форматованого тексту Telegram — користуйтеся кнопками копіювання в цьому конструкторі.
                </li>
              </ul>
            </div>
          </div>

          {/* Step 1 */}
          <div className="space-y-2">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-xs flex items-center justify-center font-bold">
                1
              </span>
              Як отримати ID вашого каналу
            </h3>
            <p className="text-xs text-slate-300">
              Формат ID завжди починається з мінуса (наприклад,{' '}
              <code className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded font-mono">
                -1001234567890
              </code>
              ).
            </p>
            <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3 text-xs space-y-1">
              <p>1. Відкрийте ваш канал у Telegram.</p>
              <p>
                2. Перешліть будь-яке повідомлення з каналу в особисті повідомлення боту{' '}
                <a
                  href="https://t.me/DtekSchedulePowerOutSenderBot"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 underline font-mono"
                >
                  @DtekSchedulePowerOutSenderBot
                </a>
                .
              </p>
              <p>3. Бот у відповідь надішле число з мінусом — це і є ваш ID каналу.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-2">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-xs flex items-center justify-center font-bold">
                2
              </span>
              Режим безпечного тестування (команда &quot;this&quot;)
            </h3>
            <p className="text-xs text-slate-300">
              Щоб перевірити вигляд повідомлень і правильність команд без публікації в канал,
              увімкніть перемикач <strong>&quot;Режим тестування (this)&quot;</strong> у конструкторі.
            </p>
            <p className="text-xs text-slate-400">
              Надішліть команди зі словом <code className="bg-slate-800 text-emerald-400 px-1 rounded">this</code> боту в приватні повідомлення — бот згенерує пробне повідомлення прямо у вашому чаті!
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-2">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-xs flex items-center justify-center font-bold">
                3
              </span>
              Інтеграція зі СвітлоБот (ключ key)
            </h3>
            <p className="text-xs text-slate-300">
              Дозволяє автоматично оновлювати графік на картинках у вашому каналі та правильний рядок &quot;очікуємо о...&quot; у СвітлоБоті.
            </p>
            <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3 text-xs space-y-1">
              <p>
                1. Відкрийте бота{' '}
                <a
                  href="https://t.me/SvitloUkraineBot"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 underline font-mono"
                >
                  @SvitloUkraineBot
                </a>
                .
              </p>
              <p>2. Натисніть кнопку <strong>&quot;Статус&quot;</strong>.</p>
              <p>3. Скопіюйте наданий ключ (наприклад, <code className="text-sky-300 font-mono">AAABBBCCCD</code>) та вставте його в поле &quot;Ключ СвітлоБота&quot;.</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="space-y-2">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-xs flex items-center justify-center font-bold">
                4
              </span>
              Що означають команди sst та ec для порожніх графіків
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="font-semibold text-amber-400 block mb-1">Команда sst (час надсилання):</span>
                <ul className="space-y-1 text-slate-300 list-disc list-inside">
                  <li><strong>Додатні (20):</strong> надсилати о 20:00 на завтра, якщо немає відключень.</li>
                  <li><strong>-1:</strong> надсилати тільки при появі графіка в інших групах.</li>
                  <li><strong>Менше -1 (-22):</strong> надсилати при змінах в інших групах або о 22:00 (що настане раніше).</li>
                </ul>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="font-semibold text-amber-400 block mb-1">Команда ec (ліміт днів):</span>
                <p className="text-slate-300">
                  <code className="text-emerald-300 font-mono">ec 1</code> означає перестати повторно штурмувати канал сповіщеннями про &quot;відключень не заплановано&quot; через 1 день, якщо відключень не було і немає змін.
                </p>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-4 text-xs">
            <a
              href="https://world-wide-web.notion.site/DtekSchedulePowerOutSenderBot-2b04e9eac65a806dadd8ead3c49b410f"
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>Інструкція на Notion (від дописувача спільноти)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://t.me/DtekSchedulePowerOutSenderBot"
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>Чат з ботом @DtekSchedulePowerOutSenderBot</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
