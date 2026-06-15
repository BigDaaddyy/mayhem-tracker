import { useState, useEffect, useCallback } from "react";
import { useI18n } from "../hooks/useI18n";
import type { Locale } from "../lib/i18n";

export default function Settings() {
  const { t, locale, setLocale } = useI18n();
  const [minimizeToTray, setMinimizeToTray] = useState(true);
  const [loading, setLoading] = useState(true);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [repairStatus, setRepairStatus] = useState<string | null>(null);
  const [gameDataStatus, setGameDataStatus] = useState<string | null>(null);
  const [gameDataRefreshing, setGameDataRefreshing] = useState(false);
  const [gameDataVersion, setGameDataVersion] = useState("");

  useEffect(() => {
    window.api.getGameDataVersion().then(setGameDataVersion);
    const unsub = window.api.onGameDataUpdated((result) => {
      setGameDataVersion(result.version);
    });
    return unsub;
  }, []);

  useEffect(() => {
    window.api.getSetting("minimize_to_tray").then((val: string | null) => {
      setMinimizeToTray(val !== "false");
      setLoading(false);
    });
  }, []);

  const handleToggle = useCallback(async () => {
    const next = !minimizeToTray;
    setMinimizeToTray(next);
    await window.api.setSetting("minimize_to_tray", String(next));
  }, [minimizeToTray]);

  const handleLanguage = useCallback(
    async (lang: Locale) => {
      if (lang === locale) return;
      await setLocale(lang);
    },
    [locale, setLocale],
  );

  const handleExport = useCallback(async () => {
    setExportStatus(null);
    try {
      const result = await window.api.exportData();
      if (result.success) {
        setExportStatus(t("settings.exportedTo", { path: result.path! }));
      } else {
        setExportStatus(null);
      }
    } catch (err: any) {
      setExportStatus(t("error", { message: err.message }));
    }
  }, [t]);

  const handleImport = useCallback(async () => {
    setImportStatus(null);
    try {
      const result = await window.api.importData();
      if (result.success) {
        setImportStatus(t("settings.importedGames", { count: result.imported! }));
      } else {
        setImportStatus(null);
      }
    } catch (err: any) {
      setImportStatus(t("error", { message: err.message }));
    }
  }, [t]);

  const handleRepair = useCallback(async () => {
    setRepairStatus(null);
    try {
      const result = await window.api.repairPuuids();
      setRepairStatus(
        t("settings.repaired", {
          games: result.repairedGames,
          accounts: result.discoveredAccounts,
        }),
      );
    } catch (err: any) {
      setRepairStatus(t("error", { message: err.message }));
    }
  }, [t]);

  const handleRefreshGameData = useCallback(async () => {
    setGameDataRefreshing(true);
    setGameDataStatus(null);
    try {
      const result = await window.api.reloadGameData();
      setGameDataVersion(result.version);
      setGameDataStatus(
        t("settings.gameDataUpdated", {
          version: result.version,
          champions: result.champions,
          augments: result.augments,
        }),
      );
    } catch (err: any) {
      setGameDataStatus(t("error", { message: err.message }));
    } finally {
      setGameDataRefreshing(false);
    }
  }, [t]);

  if (loading) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-lol-text-bright">{t("settings.title")}</h1>

      <div className="bg-lol-card rounded-xl border border-lol-border p-5">
        <h2 className="text-sm font-semibold text-lol-text-bright mb-4">{t("settings.language")}</h2>
        <div className="flex items-center justify-between">
          <p className="text-xs text-lol-text">{t("settings.languageDesc")}</p>
          <div className="flex gap-2">
            {(["zh", "en"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguage(lang)}
                className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                  locale === lang
                    ? "bg-lol-gold/20 text-lol-gold border-lol-gold/50"
                    : "text-lol-text border-lol-border hover:border-lol-border/80"
                }`}
              >
                {t(`settings.${lang}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-lol-card rounded-xl border border-lol-border p-5">
        <h2 className="text-sm font-semibold text-lol-text-bright mb-4">{t("settings.exitBehavior")}</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-lol-text-bright">{t("settings.minimizeToTray")}</p>
            <p className="text-xs text-lol-text mt-0.5">{t("settings.minimizeToTrayDesc")}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={minimizeToTray}
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
              minimizeToTray ? "bg-lol-gold" : "bg-lol-border"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                minimizeToTray ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="bg-lol-card rounded-xl border border-lol-border p-5">
        <h2 className="text-sm font-semibold text-lol-text-bright mb-4">{t("settings.gameData")}</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-lol-text-bright">{t("settings.refreshGameData")}</p>
              <p className="text-xs text-lol-text mt-0.5">
                {t("settings.refreshGameDataDesc", {
                  patch: gameDataVersion
                    ? t("settings.currentPatch", { version: gameDataVersion })
                    : "",
                })}
              </p>
            </div>
            <button
              onClick={handleRefreshGameData}
              disabled={gameDataRefreshing}
              className="px-4 py-1.5 rounded text-sm bg-lol-gold/20 text-lol-gold hover:bg-lol-gold/30 disabled:opacity-50 transition-colors"
            >
              {gameDataRefreshing ? t("settings.refreshing") : t("settings.refresh")}
            </button>
          </div>
          {gameDataStatus && <p className="text-xs text-lol-text">{gameDataStatus}</p>}
        </div>
      </div>

      <div className="bg-lol-card rounded-xl border border-lol-border p-5">
        <h2 className="text-sm font-semibold text-lol-text-bright mb-4">{t("settings.dataManagement")}</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-lol-text-bright">{t("settings.export")}</p>
              <p className="text-xs text-lol-text mt-0.5">{t("settings.exportDesc")}</p>
            </div>
            <button
              onClick={handleExport}
              className="px-4 py-1.5 rounded text-sm bg-lol-gold/20 text-lol-gold hover:bg-lol-gold/30 transition-colors"
            >
              {t("settings.export")}
            </button>
          </div>
          {exportStatus && <p className="text-xs text-lol-text">{exportStatus}</p>}

          <div className="border-t border-lol-border" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-lol-text-bright">{t("settings.import")}</p>
              <p className="text-xs text-lol-text mt-0.5">{t("settings.importDesc")}</p>
            </div>
            <button
              onClick={handleImport}
              className="px-4 py-1.5 rounded text-sm bg-lol-gold/20 text-lol-gold hover:bg-lol-gold/30 transition-colors"
            >
              {t("settings.import")}
            </button>
          </div>
          {importStatus && <p className="text-xs text-lol-text">{importStatus}</p>}

          <div className="border-t border-lol-border" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-lol-text-bright">{t("settings.repair")}</p>
              <p className="text-xs text-lol-text mt-0.5">{t("settings.repairDesc")}</p>
            </div>
            <button
              onClick={handleRepair}
              className="px-4 py-1.5 rounded text-sm bg-lol-gold/20 text-lol-gold hover:bg-lol-gold/30 transition-colors"
            >
              {t("settings.repair")}
            </button>
          </div>
          {repairStatus && <p className="text-xs text-lol-text">{repairStatus}</p>}
        </div>
      </div>
    </div>
  );
}
