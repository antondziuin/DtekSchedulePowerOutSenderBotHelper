export interface RegionInfo {
  code: string;
  name: string;
  provider: string;
  defaultGroups: string[];
}

export type LeadingSymbolMode = '0' | '_';

export type SstMode = 'disabled' | 'specific_time' | 'other_groups' | 'earlier_of_both';

export interface BotConfig {
  channelId: string;
  channelTitle?: string; // location/channel name in Svitlobot (e.g. "Провулок Артилерійський 5Б")
  isTestMode: boolean; // if true, uses "this" instead of channelId
  region: string;
  group: string;
  delOld: boolean;
  picOnly: boolean;
  leadingZero: LeadingSymbolMode;
  headerTemplate: string;
  periodTemplate: string;
  svitlobotKey: string;
  emptyTemplate: string;
  sstMode: SstMode;
  sstValue: number; // e.g. 20 (for 20:00) or -22 (or -1)
  ecValue: number; // e.g. 1
  enableEmptySchedule: boolean;
}

export interface OutageInterval {
  start: string; // e.g. "00:00"
  end: string;   // e.g. "04:00"
  hours: number; // e.g. 4
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  headerTemplate: string;
  periodTemplate: string;
  emptyTemplate: string;
  leadingZero: LeadingSymbolMode;
  delOld: boolean;
}

export interface GeneratedCommand {
  key: string;
  label: string;
  description: string;
  command: string;
  category: 'core' | 'formatting' | 'svitlobot' | 'empty' | 'management';
  isOptional?: boolean;
}
