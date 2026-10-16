/**
 * Сервіс для отримання номерів груп відключень світла для м. Київ з порталу YASNO
 * Джерело логіки: https://sergeymaximenko.github.io/SetTimeGenerator/GetGroupForKiev.html
 */

export const PROXY_BASE = 'https://getnubergroupproxy.onrender.com';

export interface StreetItem {
  id: number;
  name: string;
}

export interface HouseItem {
  id: number;
  name: string;
}

export interface KyivGroupApiResponse {
  ok: boolean;
  street?: string;
  house?: string;
  streetId?: number;
  houseId?: number;
  group?: number;
  subgroup?: number;
  message?: string;
}

export interface KyivGroupResult {
  ok: boolean;
  formattedGroup: string;
  groupNumber?: number;
  subgroupNumber?: number;
  street: string;
  house: string;
  error?: string;
}

/**
 * Форматує номер групи та підгрупи у звичний для бота вигляд (напр. '20.1', '4.1', '1.1')
 */
export function formatGroupString(group: number, subgroup?: number | null): string {
  if (subgroup !== undefined && subgroup !== null) {
    return `${group}.${subgroup}`;
  }
  return `${group}`;
}

/**
 * Пінгує сервер Render, щоб розбудити його, якщо він заснув
 */
export async function warmupRenderService(signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(`${PROXY_BASE}/`, {
      method: 'GET',
      cache: 'no-store',
      signal,
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Пошук вулиць у Києві за запитом (від 3 символів)
 */
export async function searchKyivStreets(
  query: string,
  signal?: AbortSignal
): Promise<StreetItem[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const url = `${PROXY_BASE}/api/streets?q=${encodeURIComponent(trimmed)}`;
  const res = await fetch(url, { cache: 'no-store', signal });
  if (!res.ok) {
    throw new Error(`Помилка запиту вулиць: HTTP ${res.status}`);
  }
  const data = await res.json();
  if (Array.isArray(data)) {
    return data;
  }
  return [];
}

/**
 * Отримання списку будинків для обраної вулиці
 */
export async function searchKyivHouses(
  streetId: number,
  query: string = '',
  signal?: AbortSignal
): Promise<HouseItem[]> {
  if (!streetId) return [];

  const trimmed = query.trim();
  const url = `${PROXY_BASE}/api/houses?streetId=${encodeURIComponent(
    streetId
  )}&q=${encodeURIComponent(trimmed)}`;
  const res = await fetch(url, { cache: 'no-store', signal });
  if (!res.ok) {
    throw new Error(`Помилка запиту будинків: HTTP ${res.status}`);
  }
  const data = await res.json();
  if (Array.isArray(data)) {
    return data;
  }
  return [];
}

/**
 * Отримання черги (групи) з порталу YASNO за назвою вулиці та номером будинку
 */
export async function getKyivGroupForAddress(
  street: string,
  house: string,
  signal?: AbortSignal
): Promise<KyivGroupResult> {
  const streetTrimmed = street.trim();
  const houseTrimmed = house.trim();

  if (!streetTrimmed) {
    return {
      ok: false,
      formattedGroup: '',
      street: streetTrimmed,
      house: houseTrimmed,
      error: 'Введіть назву вулиці',
    };
  }

  if (!houseTrimmed) {
    return {
      ok: false,
      formattedGroup: '',
      street: streetTrimmed,
      house: houseTrimmed,
      error: 'Введіть номер будинку',
    };
  }

  const url = `${PROXY_BASE}/api/group?street=${encodeURIComponent(
    streetTrimmed
  )}&house=${encodeURIComponent(houseTrimmed)}`;

  const res = await fetch(url, { cache: 'no-store', signal });
  const data: KyivGroupApiResponse = await res.json();

  if (!data.ok || data.group === undefined) {
    return {
      ok: false,
      formattedGroup: '',
      street: streetTrimmed,
      house: houseTrimmed,
      error: data.message || 'Не вдалося визначити чергу для цієї адреси на порталі YASNO',
    };
  }

  const formatted = formatGroupString(data.group, data.subgroup);

  return {
    ok: true,
    formattedGroup: formatted,
    groupNumber: data.group,
    subgroupNumber: data.subgroup,
    street: streetTrimmed,
    house: houseTrimmed,
  };
}
