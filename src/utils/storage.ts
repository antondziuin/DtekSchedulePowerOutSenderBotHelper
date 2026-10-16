import type { BotConfig } from '../types/index.ts';

export const STORAGE_KEY_CONFIG = 'dtek_bot_config_v2';
export const STORAGE_KEY_MODE = 'dtek_app_mode';
export const STORAGE_KEY_WIZARD_STEP = 'dtek_wizard_step';

export const DEFAULT_CONFIG: BotConfig = {
  channelId: '-1001234567890',
  channelTitle: 'Провулок Артилерійський 5Б',
  isTestMode: false,
  region: 'k',
  group: '2.2',
  delOld: true,
  picOnly: false,
  leadingZero: '_',
  headerTemplate: '🗓Графік відключень, {group} група',
  periodTemplate: '{s} - {f}',
  svitlobotKey: 'AAABBBCCCD',
  emptyTemplate: '- інформація про планові відключення відсутня',
  sstMode: 'earlier_of_both',
  sstValue: 22,
  ecValue: 1,
  enableEmptySchedule: true,
};

/**
 * Safely loads bot config from localStorage, falling back to DEFAULT_CONFIG.
 * Merges loaded fields with default config so newly introduced fields are always populated.
 */
export function loadSavedConfig(): BotConfig {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return DEFAULT_CONFIG;
    }
    const raw = window.localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) {
      return DEFAULT_CONFIG;
    }
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) {
      return DEFAULT_CONFIG;
    }
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
    };
  } catch (e) {
    console.warn('Failed to read config from localStorage:', e);
    return DEFAULT_CONFIG;
  }
}

/**
 * Safely saves bot config to localStorage.
 */
export function saveSavedConfig(config: BotConfig): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    }
  } catch (e) {
    console.warn('Failed to save config to localStorage:', e);
  }
}

/**
 * Loads current editor mode: 'wizard' | 'advanced'.
 * Defaults to 'wizard' for friendly experience.
 */
export function loadSavedMode(): 'wizard' | 'advanced' {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return 'wizard';
    }
    const saved = window.localStorage.getItem(STORAGE_KEY_MODE);
    if (saved === 'advanced' || saved === 'wizard') {
      return saved;
    }
    return 'wizard';
  } catch {
    return 'wizard';
  }
}

/**
 * Saves current editor mode.
 */
export function saveSavedMode(mode: 'wizard' | 'advanced'): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY_MODE, mode);
    }
  } catch (e) {
    console.warn('Failed to save mode to localStorage:', e);
  }
}

/**
 * Loads wizard step (1 to 5).
 */
export function loadSavedWizardStep(): number {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return 1;
    }
    const saved = window.localStorage.getItem(STORAGE_KEY_WIZARD_STEP);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 5) {
        return parsed;
      }
    }
    return 1;
  } catch {
    return 1;
  }
}

/**
 * Saves current wizard step.
 */
export function saveSavedWizardStep(step: number): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY_WIZARD_STEP, step.toString());
    }
  } catch (e) {
    console.warn('Failed to save wizard step to localStorage:', e);
  }
}

/**
 * Clears saved state and resets back to defaults.
 */
export function clearSavedState(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY_CONFIG);
      window.localStorage.removeItem(STORAGE_KEY_WIZARD_STEP);
    }
  } catch (e) {
    console.warn('Failed to clear localStorage:', e);
  }
}
