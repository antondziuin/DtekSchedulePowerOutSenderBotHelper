import React, { useState, useEffect } from 'react';
import { BotConfig, Preset } from './types/index.ts';
import { UKRAINE_REGIONS } from './data/regions.ts';
import { Header } from './components/Header.tsx';
import { ConfigForm } from './components/ConfigForm.tsx';
import { WizardMode } from './components/WizardMode.tsx';
import { TelegramPostPreview } from './components/TelegramPostPreview.tsx';
import { CommandOutput } from './components/CommandOutput.tsx';
import { PresetsModal } from './components/PresetsModal.tsx';
import { InstructionModal } from './components/InstructionModal.tsx';
import { KievGroupFinderModal } from './components/KievGroupFinderModal.tsx';
import {
  DEFAULT_CONFIG,
  loadSavedConfig,
  saveSavedConfig,
  loadSavedMode,
  saveSavedMode,
  loadSavedWizardStep,
  saveSavedWizardStep,
  clearSavedState,
} from './utils/storage.ts';
import {
  Sliders,
  Eye,
  Terminal,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Wand2,
  MapPin,
} from 'lucide-react';

export default function App() {
  const [config, setConfig] = useState<BotConfig>(() => loadSavedConfig());
  const [mode, setMode] = useState<'wizard' | 'advanced'>(() => loadSavedMode());
  const [wizardStep, setWizardStep] = useState<number>(() => loadSavedWizardStep());

  const [activeMobileTab, setActiveMobileTab] = useState<'editor' | 'preview' | 'commands'>('editor');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isKyivFinderOpen, setIsKyivFinderOpen] = useState(false);

  // Automatically persist config to localStorage on every change
  useEffect(() => {
    saveSavedConfig(config);
  }, [config]);

  // Automatically persist mode
  useEffect(() => {
    saveSavedMode(mode);
  }, [mode]);

  // Automatically persist wizard step
  useEffect(() => {
    saveSavedWizardStep(wizardStep);
  }, [wizardStep]);

  const regionInfo = UKRAINE_REGIONS.find((r) => r.code === config.region);
  const regionName = regionInfo ? regionInfo.name : config.region;

  const handleApplyPreset = (preset: Preset) => {
    setConfig((prev) => ({
      ...prev,
      headerTemplate: preset.headerTemplate,
      periodTemplate: preset.periodTemplate,
      emptyTemplate: preset.emptyTemplate,
      leadingZero: preset.leadingZero,
      delOld: preset.delOld,
    }));
  };

  const handleApplyKyivGroup = (group: string, addressTitle?: string) => {
    setConfig((prev) => ({
      ...prev,
      region: 'k',
      group,
      ...(addressTitle ? { channelTitle: addressTitle } : {}),
    }));
  };

  const handleReset = () => {
    if (window.confirm('Ви впевнені, що хочете скинути налаштування до початкових стандартів?')) {
      clearSavedState();
      setConfig(DEFAULT_CONFIG);
      setWizardStep(1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header with Mode Switcher */}
      <Header
        mode={mode}
        onModeToggle={setMode}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenKyivFinder={() => setIsKyivFinderOpen(true)}
      />

      {/* Mobile Tab Navigator (visible only on small screens) */}
      <div className="lg:hidden sticky top-[57px] z-20 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-2 flex items-center justify-center gap-1">
        <button
          type="button"
          onClick={() => setActiveMobileTab('editor')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeMobileTab === 'editor'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-800'
          }`}
        >
          {mode === 'wizard' ? <Wand2 className="w-3.5 h-3.5" /> : <Sliders className="w-3.5 h-3.5" />}
          <span>{mode === 'wizard' ? 'Майстер' : 'Налаштування'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMobileTab('preview')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeMobileTab === 'preview'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-800'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Перегляд Telegram</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMobileTab('commands')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeMobileTab === 'commands'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-800'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Команди</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Form Configuration / Wizard (6 cols on desktop) */}
          <div
            className={`space-y-6 lg:col-span-6 ${
              activeMobileTab === 'preview' ? 'hidden lg:block' : ''
            }`}
          >
            {mode === 'wizard' ? (
              /* WIZARD MODE */
              <div className={activeMobileTab === 'commands' ? 'hidden lg:block' : ''}>
                <WizardMode
                  config={config}
                  onChange={setConfig}
                  currentStep={wizardStep}
                  onStepChange={setWizardStep}
                  onSwitchToAdvanced={() => setMode('advanced')}
                  onOpenHelp={() => setIsHelpOpen(true)}
                  onOpenKyivFinder={() => setIsKyivFinderOpen(true)}
                  onReset={handleReset}
                />
              </div>
            ) : (
              /* ADVANCED / FULL FORM MODE */
              <>
                <div className={activeMobileTab === 'commands' ? 'hidden lg:block' : ''}>
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="text-amber-400 font-bold">🛠 Повний режим:</span>
                      <span>Доступні всі параметри, HTML-теги та розмітка.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMode('wizard')}
                      className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer shrink-0"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Перейти у Візард</span>
                    </button>
                  </div>

                  <ConfigForm
                    config={config}
                    onChange={setConfig}
                    onOpenPresets={() => setIsPresetsOpen(true)}
                    onOpenHelp={() => setIsHelpOpen(true)}
                    onOpenKyivFinder={() => setIsKyivFinderOpen(true)}
                  />
                </div>

                {/* Ready Commands Box in Advanced mode */}
                <div className={activeMobileTab === 'editor' ? 'hidden lg:block' : ''}>
                  <CommandOutput config={config} />
                </div>
              </>
            )}
          </div>

          {/* Right Column: Live Telegram Post Preview (6 cols on desktop, sticky) */}
          <div
            className={`lg:col-span-6 lg:sticky lg:top-20 space-y-4 ${
              activeMobileTab !== 'preview' ? 'hidden lg:block' : ''
            }`}
          >
            <TelegramPostPreview config={config} regionName={regionName} />

            {/* Quick Tips card */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Як застосувати налаштування в Telegram:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                <li>Додайте бота як адміна у ваш канал (дозвіл на надсилання).</li>
                <li>
                  <strong className="text-amber-300">Надсилайте команди ТІЛЬКИ по черзі</strong> (кожну окремим повідомленням) у приватний діалог з ботом.
                </li>
                <li>При зміні графіків бот автоматично опублікує пост із заданим форматуванням.</li>
              </ol>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <p className="text-slate-300">
              Розробив:{' '}
              <a
                href="https://t.me/Dziuin"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 font-bold hover:underline inline-flex items-center gap-0.5"
              >
                @Dziuin
              </a>{' '}
              для спільноти СвітлоБот та каналів графіків ДТЕК в Україні 🇺🇦
            </p>
            <p className="text-[11px] text-slate-500">
              Автори бота @DtekSchedulePowerOutSenderBot:{' '}
              <strong className="text-slate-400">@the_route_66</strong>,{' '}
              <strong className="text-slate-400">@Baskerville42</strong>
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 text-slate-400">
            <button
              type="button"
              onClick={() => setIsKyivFinderOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 hover:underline inline-flex items-center gap-1 cursor-pointer font-medium"
            >
              <MapPin className="w-3.5 h-3.5" />
              Пошук черги Київ (YASNO)
            </button>
            <a
              href="https://world-wide-web.notion.site/DtekSchedulePowerOutSenderBot-2b04e9eac65a806dadd8ead3c49b410f"
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 hover:underline inline-flex items-center gap-1"
            >
              Інструкція від дописувача
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={handleApplyPreset}
      />

      <InstructionModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <KievGroupFinderModal
        isOpen={isKyivFinderOpen}
        onClose={() => setIsKyivFinderOpen(false)}
        onSelectGroup={handleApplyKyivGroup}
      />
    </div>
  );
}
