import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  type FontSizePercent,
  FONT_SIZE_SETTING_KEY,
  DEFAULT_FONT_SIZE,
  parseFontSize,
  applyFontSize,
} from "../lib/fontSize";

interface FontSizeContextValue {
  fontSize: FontSizePercent;
  setFontSize: (percent: FontSizePercent) => Promise<void>;
}

const FontSizeContext = createContext<FontSizeContextValue | null>(null);

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSizePercent>(DEFAULT_FONT_SIZE);

  useEffect(() => {
    window.api.getSetting(FONT_SIZE_SETTING_KEY).then((val) => {
      const percent = parseFontSize(val);
      applyFontSize(percent);
      setFontSizeState(percent);
    });
  }, []);

  const setFontSize = useCallback(async (percent: FontSizePercent) => {
    setFontSizeState(percent);
    applyFontSize(percent);
    await window.api.setSetting(FONT_SIZE_SETTING_KEY, String(percent));
  }, []);

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize(): FontSizeContextValue {
  const ctx = useContext(FontSizeContext);
  if (!ctx) throw new Error("useFontSize must be used within FontSizeProvider");
  return ctx;
}
