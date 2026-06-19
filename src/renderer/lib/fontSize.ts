export const FONT_SIZE_OPTIONS = [80, 90, 100, 110, 120, 130] as const;
export type FontSizePercent = (typeof FONT_SIZE_OPTIONS)[number];

export const DEFAULT_FONT_SIZE: FontSizePercent = 100;
export const FONT_SIZE_SETTING_KEY = "font_size";

export function parseFontSize(val: string | null): FontSizePercent {
  const n = Number(val);
  if (FONT_SIZE_OPTIONS.includes(n as FontSizePercent)) {
    return n as FontSizePercent;
  }
  return DEFAULT_FONT_SIZE;
}

export function applyFontSize(percent: FontSizePercent): void {
  document.documentElement.style.fontSize = `${percent}%`;
}
