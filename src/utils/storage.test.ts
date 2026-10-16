import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_CONFIG,
  loadSavedConfig,
  saveSavedConfig,
  loadSavedMode,
  saveSavedMode,
  loadSavedWizardStep,
  saveSavedWizardStep,
} from './storage.ts';

// Mock localStorage in Node.js environment
const mockStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => {
    mockStorage[key] = val;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  },
};

Object.defineProperty(globalThis, 'window', {
  value: { localStorage: localStorageMock },
  writable: true,
});

test('storage returns DEFAULT_CONFIG when empty', () => {
  localStorageMock.clear();
  const config = loadSavedConfig();
  assert.equal(config.region, DEFAULT_CONFIG.region);
  assert.equal(config.group, DEFAULT_CONFIG.group);
});

test('storage saves and retrieves updated config without losing new fields', () => {
  localStorageMock.clear();
  const custom = {
    ...DEFAULT_CONFIG,
    channelId: '-100987654321',
    region: 'd',
    group: '3.1',
    isTestMode: true,
  };
  saveSavedConfig(custom);
  const loaded = loadSavedConfig();
  assert.equal(loaded.channelId, '-100987654321');
  assert.equal(loaded.region, 'd');
  assert.equal(loaded.group, '3.1');
  assert.equal(loaded.isTestMode, true);
  assert.equal(loaded.sstMode, 'earlier_of_both'); // preserved default field
});

test('storage persists wizard step and editor mode', () => {
  localStorageMock.clear();
  assert.equal(loadSavedMode(), 'wizard');
  assert.equal(loadSavedWizardStep(), 1);

  saveSavedMode('advanced');
  assert.equal(loadSavedMode(), 'advanced');

  saveSavedWizardStep(4);
  assert.equal(loadSavedWizardStep(), 4);

  // invalid step defaults to 1
  saveSavedWizardStep(99);
  assert.equal(loadSavedWizardStep(), 1);
});
