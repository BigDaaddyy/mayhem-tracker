import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  type Locale,
  type MessageKey,
  translate,
  formatTimeAgo as formatTimeAgoFn,
  kdaRatioText,
} from "../lib/i18n";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
  formatTimeAgo: (timestamp: number) => string;
  kdaRatio: (kills: number, deaths: number, assists: number) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");

  useEffect(() => {
    window.api.getSetting("language").then((val) => {
      setLocaleState(val === "en" ? "en" : "zh");
    });
  }, []);

  const setLocale = useCallback(async (next: Locale) => {
    setLocaleState(next);
    await window.api.setSetting("language", next);
    await window.api.reloadGameData();
  }, []);

  const t = useCallback(
    (key: MessageKey, params?: Record<string, string | number>) =>
      translate(locale, key, params),
    [locale],
  );

  const formatTimeAgo = useCallback(
    (timestamp: number) => formatTimeAgoFn(locale, timestamp),
    [locale],
  );

  const kdaRatio = useCallback(
    (kills: number, deaths: number, assists: number) =>
      kdaRatioText(locale, kills, deaths, assists),
    [locale],
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, formatTimeAgo, kdaRatio }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
