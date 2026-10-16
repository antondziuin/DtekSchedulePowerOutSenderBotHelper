import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  const [allHouses, setAllHouses] = useState<HouseItem[]>([]);
  const [isHouseLoading, setIsHouseLoading] = useState(false);

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

    // Close street dropdown on click outside
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

  // Fetch houses when a street is selected
  useEffect(() => {
    if (!selectedStreet) {
      setAllHouses([]);
      return;
    }

    let isMounted = true;
    setIsHouseLoading(true);
    setErrorMessage(null);

    // Initial load of all houses on this street
    searchKyivHouses(selectedStreet.id, '')
      .then((results) => {
        if (!isMounted) return;
        setAllHouses(results);
      })
      .catch((err) => {
        console.error('Houses fetch error:', err);
      })
      .finally(() => {
        if (isMounted) setIsHouseLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedStreet]);

  // Filtered houses based on user typing
  const filteredHouses = useMemo(() => {
    if (!houseQuery.trim()) return allHouses;
    const q = houseQuery.trim().toLowerCase();
    return allHouses.filter((h) => h.name.toLowerCase().includes(q));
  }, [allHouses, houseQuery]);

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
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredHouses.length > 0 && !selectedHouse) {
        handleSelectHouse(filteredHouses[0]);
      }
      handleResolveGroup();
    }
  };

  const handleResolveGroup = async () => {
    setShowStreetDropdown(false);
    const street = selectedStreet ? selectedStreet.name : streetQuery.trim();
    const house = selectedHouse ? selectedHouse.name : houseQuery.trim();

    if (!street) {
      setErrorMessage('Будь ласка, оберіть вулицю у м. Київ');
      streetInputRef.current?.focus();
      return;
    }

    if (!house) {
      setErrorMessage('Будь ласка, оберіть або введіть номер будинку');
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
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Закрити"
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
                  setSelectedHouse(null);
                  setResolvedResult(null);
                  setErrorMessage(null);
                }}
                onKeyDown={handleStreetKeyDown}
                onFocus={() => {
                  if (streetList.length > 0) setShowStreetDropdown(true);
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
                      setSelectedHouse(null);
                      setAllHouses([]);
                      setResolvedResult(null);
                      streetInputRef.current?.focus();
                    }}
                    className="hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </div>
            </div>

            {/* Street Dropdown - High Contrast & Clearly Visible */}
            {showStreetDropdown && streetList.length > 0 && (
              <div
                ref={streetDropdownRef}
                className="absolute z-30 top-full left-0 right-0 mt-1 bg-slate-900 border-2 border-amber-500/70 rounded-xl shadow-2xl max-h-56 overflow-y-auto divide-y divide-slate-800"
              >
                <div className="px-3.5 py-1.5 bg-slate-950 border-b border-slate-800 text-[10px] font-bold text-amber-400 flex items-center justify-between">
                  <span>Знайдені вулиці ({streetList.length}):</span>
                  <span className="text-slate-400 font-normal">натисніть Enter або клікніть</span>
                </div>
                {streetList.map((st, index) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleSelectStreet(st)}
                    className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm hover:bg-amber-500 hover:text-slate-950 transition-colors flex items-center justify-between cursor-pointer ${
                      index === streetActiveIndex
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{st.name}</span>
                    </div>
                    <span className="text-[10px] font-mono opacity-60">
                      ID: {st.id}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Confirmed Street Notice */}
            {selectedStreet && (
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3.5 py-2 text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Обрано вулицю: <strong>{selectedStreet.name}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStreet(null);
                    setSelectedHouse(null);
                    setHouseQuery('');
                    setAllHouses([]);
                    setResolvedResult(null);
                    setTimeout(() => streetInputRef.current?.focus(), 100);
                  }}
                  className="text-amber-400 hover:underline font-semibold ml-2 text-[11px] cursor-pointer"
                >
                  Змінити
                </button>
              </div>
            )}
          </div>

          {/* Step 2: House Input & Selection Panel */}
          <div className="space-y-2">
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

            {/* House Search/Filter input */}
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
                  setErrorMessage(null);
                }}
                onKeyDown={handleHouseKeyDown}
                placeholder={
                  selectedStreet
                    ? 'Введіть або оберіть номер нижче (напр.: 13, 22 або 38/А)...'
                    : 'Спочатку оберіть вулицю...'
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
                    className="hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Home className="w-4 h-4" />
                )}
              </div>
            </div>

            {/* Embedded High-Visibility Houses Selection Grid (in-flow, never cut off!) */}
            {selectedStreet && (
              <div className="bg-slate-950/80 border-2 border-slate-800 rounded-xl p-3 sm:p-4 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <span>Номери на {selectedStreet.name}:</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {selectedHouse && (
                      <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        №{selectedHouse.name}
                      </span>
                    )}
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                      {isHouseLoading ? 'Завантаження…' : `${filteredHouses.length} із ${allHouses.length}`}
                    </span>
                  </div>
                </div>

                {isHouseLoading ? (
                  <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Отримуємо офіційний список номерів з YASNO…</span>
                  </div>
                ) : filteredHouses.length > 0 ? (
                  <>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5 max-h-48 overflow-y-auto p-1 pr-1.5">
                      {filteredHouses.map((h) => {
                        const isSelected = (selectedHouse?.name || houseQuery.trim()) === h.name;
                        return (
                          <button
                            key={h.id}
                            type="button"
                            onClick={() => handleSelectHouse(h)}
                            className={`py-2 px-1 text-center text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md ring-2 ring-amber-400/50 scale-105 z-10'
                                : 'bg-slate-850 hover:bg-amber-500/20 hover:border-amber-400 hover:text-amber-200 text-white border-slate-700/80'
                            }`}
                            title={`Обрати будинок №${h.name}`}
                          >
                            {h.name}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-slate-400 text-center pt-1">
                      💡 Натисніть номер будинку вище або введіть його в полі для швидкої фільтрації
                    </p>
                  </>
                ) : (
                  <div className="py-4 text-center text-xs text-slate-400">
                    Номерів з &quot;{houseQuery}&quot; не знайдено серед завантажених. Ви можете натиснути кнопку нижче, щоб спробувати знайти безпосередньо.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Button: Get Group */}
          <button
            type="button"
            disabled={isResolving || (!selectedStreet && !streetQuery.trim()) || (!selectedHouse && !houseQuery.trim())}
            onClick={handleResolveGroup}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {isResolving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Запитуємо чергу на порталі YASNO…</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>
                  {houseQuery.trim()
                    ? `Отримати групу для №${houseQuery.trim()}`
                    : 'Отримати номер групи'}
                </span>
              </>
            )}
          </button>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-300">
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
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                  м. Київ
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <div className="text-xs text-slate-400">Адреса будинку:</div>
                  <div className="font-semibold text-white text-sm">
                    {resolvedResult.street}, {resolvedResult.house}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-slate-400">Група:</div>
                  <div className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xl tracking-wide shadow-md shadow-amber-500/30">
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
                  Також підставити адресу «{resolvedResult.street}, {resolvedResult.house}» як назву локації у налаштування
                </span>
              </label>

              <button
                type="button"
                onClick={handleApplyGroup}
                className="w-full py-3 px-4 rounded-xl font-extrabold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Застосувати чергу {resolvedResult.group} у налаштування</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
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
