import type { BotConfig, GeneratedCommand } from '../types/index.ts';

/**
 * Normalizes channel ID input:
 * - In test mode, returns 'this'
 * - In normal mode, ensures Telegram channel ID begins with negative sign (e.g. -1001234567890)
 */
export function normalizeTargetId(channelId: string, isTestMode: boolean): string {
  if (isTestMode) {
    return 'this';
  }
  const trimmed = (channelId || '').trim();
  if (!trimmed) {
    return '-100XXXXXXXXXX';
  }
  if (trimmed.startsWith('-')) {
    return trimmed;
  }
  // User entered 100... without minus, or raw positive digits
  return `-${trimmed}`;
}

/**
 * Generates the sequence of bot configuration commands based on user settings
 */
export function generateBotCommands(config: BotConfig): GeneratedCommand[] {
  const target = normalizeTargetId(config.channelId, config.isTestMode);
  const region = (config.region || 'k').trim();
  const group = (config.group || '1.1').trim();

  const commands: GeneratedCommand[] = [];

  // 1. Core subscription command
  const flags: string[] = [];
  if (config.delOld) flags.push('+delold');
  if (config.picOnly) flags.push('+piconly');
  const flagsStr = flags.length > 0 ? ` ${flags.join(' ')}` : '';

  commands.push({
    key: 'subscription',
    category: 'core',
    label: '1. Реєстрація каналу та черги',
    description: 'Підключає сповіщення для вибраного регіону та черги' + (config.delOld ? ' з автовидаленням попередніх графіків' : ''),
    command: `${target} ${region} ${group}${flagsStr}`,
  });

  // 2. Leading symbol formatting (ls)
  commands.push({
    key: 'ls',
    category: 'formatting',
    label: '2. Формат відображення годин (ls)',
    description: config.leadingZero === '0' 
      ? 'Додає провідний нуль перед одиничними годинами (наприклад, 09:00)' 
      : 'Без провідного нуля (наприклад, 9:00)',
    command: `${target} ${region} ls ${config.leadingZero}`,
  });

  // 3. Header line template (fl)
  const headerContent = config.headerTemplate.trim();
  if (headerContent) {
    commands.push({
      key: 'fl',
      category: 'formatting',
      label: '3. Шаблон заголовка повідомлення (fl)',
      description: 'Визначає перший рядок повідомлення (заголовок, дату, день тижня)',
      command: `${target} ${region} fl ${headerContent}`,
    });
  }

  // 4. Period line template (pt)
  const periodContent = config.periodTemplate.trim();
  if (periodContent) {
    commands.push({
      key: 'pt',
      category: 'formatting',
      label: '4. Шаблон рядка періоду відключення (pt)',
      description: 'Форматує кожен часовий проміжок відключення ({s} - початок, {f} - кінець, {h} - тривалість)',
      command: `${target} ${region} pt ${periodContent}`,
    });
  }

  // 5. Svitlobot Key (key)
  const svitloKey = (config.svitlobotKey || '').trim();
  if (svitloKey) {
    commands.push({
      key: 'key',
      category: 'svitlobot',
      label: '5. Інтеграція зі СвітлоБот (key)',
      description: 'Синхронізує розклад зі СвітлоБотом і оновлює статус "очікуємо о..."',
      command: `${target} ${region} key ${svitloKey}`,
      isOptional: true,
    });
  }

  // 6. Empty schedules settings
  if (config.enableEmptySchedule) {
    const emptyContent = (config.emptyTemplate || '').trim();
    if (emptyContent) {
      commands.push({
        key: 'et',
        category: 'empty',
        label: '6. Текст для днів без відключень (et)',
        description: 'Показується коли на обраний день у черзі немає запланованих відключень',
        command: `${target} ${region} et ${emptyContent}`,
      });
    }

    // SST command
    let sstCalculated: number | null = null;
    let sstDesc = '';
    if (config.sstMode === 'specific_time') {
      sstCalculated = Math.abs(config.sstValue || 20);
      sstDesc = `Відправка порожнього графіка о ${sstCalculated}:00, якщо немає інформації`;
    } else if (config.sstMode === 'other_groups') {
      sstCalculated = -1;
      sstDesc = 'Відправка порожнього графіка тільки при наявності змін у будь-якій іншій групі';
    } else if (config.sstMode === 'earlier_of_both') {
      const h = Math.abs(config.sstValue || 22);
      sstCalculated = -h;
      sstDesc = `Відправка при розкладі в інших групах або о ${h}:00 (що настане раніше)`;
    }

    if (sstCalculated !== null) {
      commands.push({
        key: 'sst',
        category: 'empty',
        label: '7. Умова відправки порожнього графіка (sst)',
        description: sstDesc,
        command: `${target} ${region} sst ${sstCalculated}`,
      });
    }

    // EC command
    const ecDays = Number(config.ecValue);
    if (!isNaN(ecDays) && ecDays >= 0) {
      commands.push({
        key: 'ec',
        category: 'empty',
        label: '8. Ліміт надсилання порожнього графіка (ec)',
        description: `Перестати надсилати порожній графік через ${ecDays} дн. без змін`,
        command: `${target} ${region} ec ${ecDays}`,
      });
    }
  }

  return commands;
}

/**
 * Generates helper commands (e.g. deletion / unlinking)
 */
export function generateManagementCommands(config: BotConfig): { deleteSub: string; deleteKey: string } {
  const target = normalizeTargetId(config.channelId, config.isTestMode);
  const region = (config.region || 'k').trim();
  return {
    deleteSub: `${target} ${region} del`,
    deleteKey: `${target} ${region} key del`,
  };
}
