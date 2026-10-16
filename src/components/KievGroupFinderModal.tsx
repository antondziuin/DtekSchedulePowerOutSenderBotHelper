import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Search,
  MapPin,
  Home,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  searchKyivStreets,
  searchKyivHouses,
  getKyivGroupForAddress,
  warmupRenderService,
  StreetItem,
  HouseItem,
} from '../services/kievGroupService.ts';

interface KievGroupFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGroup: (group: string, addressTitle?: string) => void;
  initialStreet?: string;
}

export const KievGroupFinderModal: React.FC<KievGroupFinderModalProps> = ({
  isOpen,
  onClose,
  onSelectGroup,
}) => {
  const [streetQuery, setStreetQuery] = useState('');
  const [selectedStreet, setSelectedStreet] = useState<StreetItem | null>(null);
  const [streetList, setStreetList] = useState<StreetItem[]>([]);
  const [isStreetLoading, setIsStreetLoading] = useState(false);
  const [showStreetDropdown, setShowStreetDropdown] = useState(false);
  const [streetActiveIndex, setStreetActiveIndex] = useState(-1);

  const [houseQuery, setHouseQuery] = useState('');
  const [selectedHouse, setSelectedHouse] = useState<HouseItem | null>(null);
  const [houseList, setHouseList] = useState<HouseItem[]>([]);
  const [isHouseLoading, setIsHouseLoading] = useState(false);
  const [showHouseDropdown, setShowHouseDropdown] = useState(false);
  const [houseActiveIndex, setHouseActiveIndex] = useState(-1);

  const [isResolving, setIsResolving] = useState(false);
  const [resolvedResult, setResolvedResult] = useState<{
    group: string;
    street: string;
    house: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const [setChannelTitleToo, setSetChannelTitleToo] = useState(true);

  const streetInputRef = useRef<HTMLInputElement>(null);
  const houseInputRef = useRef<HTMLInputElement>(null);
  const streetDropdownRef = useRef<HTMLDivElement>(null);
  const houseDropdownRef = useRef<HTMLDivElement>(null);

  // Warm up render proxy when modal opens
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setIsWarmingUp(true);

    warmupRenderService()
      .then(() => {
        if (isMounted) setIsWarmingUp(false);
      })
      .catch(() => {
        if (isMounted) setIsWarmingUp(false);
      });

    // Auto focus street input
    setTimeout(() => {
      streetInputRef.current?.focus();
    }, 150);

    // Close dropdowns on click outside
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        streetDropdownRef.current &&
        !streetDropdownRef.current.contains(target) &&
        streetInputRef.current &&
        !streetInputRef.current.contains(target)
      ) {
        setShowStreetDropdown(false);
      }
      if (
        houseDropdownRef.current &&
        !houseDropdownRef.current.contains(target) &&
        houseInputRef.current &&
        !houseInputRef.current.contains(target)
      ) {
        setShowHouseDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);

    return () => {
      isMounted = false;
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [isOpen]);

  // Debounced street search
  useEffect(() => {
    if (!streetQuery.trim() || selectedStreet?.name === streetQuery) {
      setStreetList([]);
      setShowStreetDropdown(false);
      return;
    }

    if (streetQuery.trim().length < 3) {
      setStreetList([]);
      setShowStreetDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsStreetLoading(true);
      try {
        const results = await searchKyivStreets(streetQuery);
        setStreetList(results);
        setShowStreetDropdown(results.length > 0);
        setStreetActiveIndex(-1);
      } catch (err) {
        console.error('Streets search error:', err);
      } finally {
        setIsStreetLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [streetQuery, selectedStreet]);

  // Debounced house search
  useEffect(() => {
    if (!selectedStreet) {
      setHouseList([]);
      setShowHouseDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsHouseLoading(true);
      try {
        const results = await searchKyivHouses(selectedStreet.id, houseQuery);
        setHouseList(results);
        setShowHouseDropdown(results.length > 0);
        setHouseActiveIndex(-1);
      } catch (err) {
        console.error('House search error:', err);
      } finally {
        setIsHouseLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedStreet, houseQuery]);

  if (!isOpen) return null;

  const handleSelectStreet = (street: StreetItem) => {
    setSelectedStreet(street);
    setStreetQuery(street.name);
    setShowStreetDropdown(false);
    setSelectedHouse(null);
    setHouseQuery('');
    setResolvedResult(null);
    setErrorMessage(null);

    setTimeout(() => {
      houseInputRef.current?.focus();
    }, 100);
  };

  const handleSelectHouse = (house: HouseItem) => {
    setSelectedHouse(house);
    setHouseQuery(house.name);
    setShowHouseDropdown(false);
    setErrorMessage(null);
  };

  const handleStreetKeyDown = (e: React.KeyboardEvent) => {
    if (!showStreetDropdown || streetList.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setStreetActiveIndex((prev) => Math.min(prev + 1, streetList.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setStreetActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (streetActiveIndex >= 0 && streetActiveIndex < streetList.length) {
        e.preventDefault();
        handleSelectStreet(streetList[streetActiveIndex]);
      } else if (streetList.length > 0) {
        e.preventDefault();
        handleSelectStreet(streetList[0]);
      } else {
        setShowStreetDropdown(false);
      }
    } else if (e.key === 'Escape') {
      setShowStreetDropdown(false);
    }
  };

  const handleHouseKeyDown = (e: React.KeyboardEvent) => {
    if (!showHouseDropdown || houseList.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHouseActiveIndex((prev) => Math.min(prev + 1, houseList.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHouseActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (houseActiveIndex >= 0 && houseActiveIndex < houseList.length) {
        e.preventDefault();
        handleSelectHouse(houseList[houseActiveIndex]);
      } else if (houseList.length > 0) {
        e.preventDefault();
        handleSelectHouse(houseList[0]);
      } else {
        setShowHouseDropdown(false);
      }
    } else if (e.key === 'Escape') {
      setShowHouseDropdown(false);
    }
  };

  const handleResolveGroup = async () => {
    setShowStreetDropdown(false);
    setShowHouseDropdown(false);
    const street = selectedStreet ? selectedStreet.name : streetQuery.trim();
    const house = selectedHouse ? selectedHouse.name : houseQuery.trim();

    if (!street) {
      setErrorMessage('Будь ласка, вкажіть вулицю');
      streetInputRef.current?.focus();
      return;
    }

    if (!house) {
      setErrorMessage('Будь ласка, оберіть номер будинку');
      houseInputRef.current?.focus();
      return;
    }

    setIsResolving(true);
    setErrorMessage(null);
    setResolvedResult(null);

    try {
      const res = await getKyivGroupForAddress(street, house);
      if (res.ok && res.formattedGroup) {
        setResolvedResult({
          group: res.formattedGroup,
          street: res.street,
          house: res.house,
        });
      } else {
        setErrorMessage(
          res.error || 'Не вдалося знайти групу для цієї адреси на порталі YASNO.'
        );
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Помилка підключення до сервісу пошуку YASNO'
      );
    } finally {
      setIsResolving(false);
    }
  };

  const handleApplyGroup = () => {
    if (!resolvedResult) return;
    const addressTitle = setChannelTitleToo
      ? `${resolvedResult.street}, ${resolvedResult.house}`
      : undefined;

    onSelectGroup(resolvedResult.group, addressTitle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg">
              🔍
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Визначити групу для Києва за адресою</span>
              </h2>
              <p className="text-xs text-slate-400">
                Пряма інтеграція з базою адрес YASNO (до 60 груп Києва)
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

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-300 text-sm">
          {/* Render Wakeup notice */}
          {isWarmingUp && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center gap-2.5 text-xs text-amber-200">
              <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
              <span>
                Підключення до сервісу YASNO… (сервер на Render може прокидатися 10–25 секунд).
              </span>
            </div>
          )}

          {/* Step 1: Street Input */}
          <div className="space-y-1.5 relative">
            <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>1. Вулиця у м. Київ:</span>
              </span>
              <span className="text-[10px] text-slate-400">
                введіть від 3 літер
              </span>
            </label>

            <div className="relative">
              <input
                ref={streetInputRef}
                type="text"
                value={streetQuery}
                onChange={(e) => {
                  setStreetQuery(e.target.value);
                  setSelectedStreet(null);
                  setResolvedResult(null);
                }}
                onKeyDown={handleStreetKeyDown}
                onFocus={() => {
                  if (streetList.length > 0) setShowStreetDropdown(true);
                }}
                onBlur={() => {
                  setTimeout(() => setShowStreetDropdown(false), 200);
                }}
                placeholder="Почніть вводити (напр.: Хрещатик, Бажана, Шевченка)..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2.5 pr-9 text-white text-sm placeholder:text-slate-600 outline-none transition-all"
                autoComplete="off"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {isStreetLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                ) : streetQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setStreetQuery('');
                      setSelectedStreet(null);
                      setStreetList([]);
                      setShowStreetDropdown(false);
                      setResolvedResult(null);
                      streetInputRef.current?.focus();
                    }}
                    className="hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </div>
            </div>

            {/* Street Dropdown */}
            {showStreetDropdown && streetList.length > 0 && (
              <div
                ref={streetDropdownRef}
                className="absolute z-20 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-700/50"
              >
                {streetList.map((st, index) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleSelectStreet(st)}
                    className={`w-full text-left px-3.5 py-2.5 text-xs sm:text-sm hover:bg-amber-500/20 hover:text-amber-200 transition-colors flex items-center justify-between cursor-pointer ${
                      index === streetActiveIndex
                        ? 'bg-amber-500/20 text-amber-200 font-semibold'
                        : 'text-slate-200'
                    }`}
                  >
                    <span>{st.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: {st.id}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: House Input */}
          <div className="space-y-1.5 relative">
            <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-amber-400" />
                <span>2. Номер будинку:</span>
              </span>
              {!selectedStreet && (
                <span className="text-[10px] text-amber-400/80">
                  (спочатку оберіть вулицю вище)
                </span>
              )}
            </label>

            <div className="relative">
              <input
                ref={houseInputRef}
                type="text"
                disabled={!selectedStreet && !streetQuery.trim()}
                value={houseQuery}
                onChange={(e) => {
                  setHouseQuery(e.target.value);
                  setSelectedHouse(null);
                  setResolvedResult(null);
                }}
                onKeyDown={handleHouseKeyDown}
                onFocus={() => {
                  if (houseList.length > 0) setShowHouseDropdown(true);
                }}
                onBlur={() => {
                  setTimeout(() => setShowHouseDropdown(false), 200);
                }}
                placeholder={
                  selectedStreet
                    ? 'Почніть вводити (напр.: 13, 22 або 38/А)...'
                    : 'Оберіть вулицю...'
                }
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-3.5 py-2.5 pr-9 text-white text-sm placeholder:text-slate-600 outline-none transition-all"
                autoComplete="off"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {isHouseLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                ) : houseQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setHouseQuery('');
                      setSelectedHouse(null);
                      setResolvedResult(null);
                      houseInputRef.current?.focus();
                    }}
                    className="hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : null}
              </div>
            </div>

            {/* House Dropdown */}
            {showHouseDropdown && houseList.length > 0 && (
              <div
                ref={houseDropdownRef}
                className="absolute z-20 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-700/50"
              >
                {houseList.map((h, index) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => handleSelectHouse(h)}
                    className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm hover:bg-amber-500/20 hover:text-amber-200 transition-colors flex items-center justify-between cursor-pointer ${
                      index === houseActiveIndex
                        ? 'bg-amber-500/20 text-amber-200 font-semibold'
                        : 'text-slate-200'
                    }`}
                  >
                    <span>{h.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Button: Get Group */}
          <button
            type="button"
            disabled={isResolving || (!selectedStreet && !streetQuery.trim()) || !houseQuery.trim()}
            onClick={handleResolveGroup}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {isResolving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Запитуємо портал YASNO…</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Отримати номер групи</span>
              </>
            )}
          </button>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-start gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Resolved Result Card */}
          {resolvedResult && (
            <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-4 sm:p-5 space-y-3.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Успішно знайдено на порталі YASNO</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded">
                  м. Київ
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <div className="text-xs text-slate-400">Адреса будинку:</div>
                  <div className="font-semibold text-white text-sm">
                    {resolvedResult.street}, {resolvedResult.house}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-slate-400">Група:</div>
                  <div className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-lg tracking-wide shadow-md shadow-amber-500/30">
                    {resolvedResult.group}
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={setChannelTitleToo}
                  onChange={(e) => setSetChannelTitleToo(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-slate-800 border-slate-700 focus:ring-amber-500 cursor-pointer"
                />
                <span>
                  Також підставити адресу «{resolvedResult.street}, {resolvedResult.house}» як назву каналу / будинку для прев&apos;ю
                </span>
              </label>

              <button
                type="button"
                onClick={handleApplyGroup}
                className="w-full py-3 px-4 rounded-xl font-extrabold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Застосувати групу {resolvedResult.group} у налаштування</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Дані отримуються з офіційного API Yasno для Києва</span>
          <a
            href="https://sergeymaximenko.github.io/SetTimeGenerator/GetGroupForKiev.html"
            target="_blank"
            rel="noreferrer"
            className="text-amber-400/80 hover:text-amber-300 hover:underline flex items-center gap-1"
          >
            Оригінал скрипта (Сергій Максименко)
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
