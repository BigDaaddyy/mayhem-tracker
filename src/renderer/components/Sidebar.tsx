import { NavLink } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import { useLcuStatus } from "../hooks/useLcuStatus";
import { useI18n } from "../hooks/useI18n";
import type { MessageKey } from "../lib/i18n";

const links: { to: string; labelKey: MessageKey; icon: string }[] = [
  { to: "/", labelKey: "nav.matchHistory", icon: "⚔️" },
  { to: "/champions", labelKey: "nav.champions", icon: "🏆" },
  { to: "/augments", labelKey: "nav.augments", icon: "🎯" },
  { to: "/analytics", labelKey: "nav.analytics", icon: "📊" },
  { to: "/friends", labelKey: "nav.friends", icon: "👥" },
  { to: "/global", labelKey: "nav.global", icon: "🌐" },
];

const statusKeys = {
  connected: "status.connected",
  connecting: "status.connecting",
  disconnected: "status.disconnected",
} as const;

export default function Sidebar() {
  const { t } = useI18n();
  const status = useLcuStatus();
  const [refreshing, setRefreshing] = useState(false);
  const [dataRefreshing, setDataRefreshing] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [version, setVersion] = useState("");
  const [gameDataVersion, setGameDataVersion] = useState("");
  const [update, setUpdate] = useState<{
    hasUpdate: boolean;
    latest?: string;
    url?: string;
  } | null>(null);

  useEffect(() => {
    window.api.getVersion().then(setVersion);
    window.api.checkForUpdate().then(setUpdate);
    window.api.getGameDataVersion().then(setGameDataVersion);
    const unsub = window.api.onGameDataUpdated((result) => {
      setGameDataVersion(result.version);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!lastResult) return;
    const timer = setTimeout(() => setLastResult(null), 10_000);
    return () => clearTimeout(timer);
  }, [lastResult]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setLastResult(null);
    try {
      const result = await window.api.refreshGames();
      setLastResult(
        result.newGames > 0
          ? t("syncFoundGames", { count: result.newGames })
          : t("syncNoGames"),
      );
    } catch (err: any) {
      setLastResult(t("error", { message: err.message }));
    } finally {
      setRefreshing(false);
    }
  }, [t]);

  const handleRefreshGameData = useCallback(async () => {
    setDataRefreshing(true);
    setLastResult(null);
    try {
      const result = await window.api.reloadGameData();
      setGameDataVersion(result.version);
      setLastResult(
        t("syncGameData", { version: result.version, augments: result.augments }),
      );
    } catch (err: any) {
      setLastResult(t("dataError", { message: err.message }));
    } finally {
      setDataRefreshing(false);
    }
  }, [t]);

  return (
    <nav className="w-56 bg-lol-card border-r border-lol-border flex flex-col shrink-0">
      <div className="titlebar-drag h-9 flex items-center px-4">
        <span className="text-lol-gold font-bold text-sm titlebar-no-drag">{t("appTitle")}</span>
      </div>
      <div className="flex flex-col gap-1 p-3 mt-2 flex-1">
        {links.map(({ to, labelKey, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-lol-gold/15 text-lol-gold"
                  : "text-lol-text hover:bg-lol-card-hover hover:text-lol-text-bright"
              }`
            }
          >
            <span>{icon}</span>
            <span>{t(labelKey)}</span>
          </NavLink>
        ))}
      </div>
      <div className="px-3 pb-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive
                ? "bg-lol-gold/15 text-lol-gold"
                : "text-lol-text hover:bg-lol-card-hover hover:text-lol-text-bright"
            }`
          }
        >
          <span>{"\u2699\uFE0F"}</span>
          <span>{t("nav.settings")}</span>
        </NavLink>
      </div>
      <div className="p-3 border-t border-lol-border flex flex-col gap-2">
        {lastResult && <span className="text-xs text-lol-text truncate">{lastResult}</span>}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${status === "connected" ? "bg-lol-win" : status === "connecting" ? "bg-amber-500" : "bg-lol-loss"}`}
            />
            <span className="text-xs text-lol-text">{t(statusKeys[status])}</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={handleRefresh}
              disabled={refreshing || dataRefreshing}
              title={t("syncTitle")}
              className="text-xs px-2 py-1 rounded bg-lol-gold/20 text-lol-gold hover:bg-lol-gold/30 disabled:opacity-50 transition-colors"
            >
              {refreshing ? "..." : t("sync")}
            </button>
            <button
              onClick={handleRefreshGameData}
              disabled={refreshing || dataRefreshing}
              title={t("dataTitle")}
              className="text-xs px-2 py-1 rounded bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 disabled:opacity-50 transition-colors"
            >
              {dataRefreshing ? "..." : t("data")}
            </button>
          </div>
        </div>
        {gameDataVersion && (
          <span className="text-[10px] text-lol-text/50">
            {t("patchData", { version: gameDataVersion })}
          </span>
        )}
        <div className="flex items-center justify-between mt-1">
          <button
            onClick={() =>
              window.api.openUrl(
                `https://github.com/BigDaaddyy/mayhem-tracker/releases/tag/v${version}`,
              )
            }
            className="text-[10px] text-lol-text/50 hover:text-lol-text transition-colors cursor-pointer"
          >
            v{version}
          </button>
          {update?.hasUpdate && (
            <button
              onClick={() => window.api.openUrl(update.url!)}
              className="text-[10px] text-lol-gold hover:text-lol-gold-light transition-colors cursor-pointer"
            >
              {t("updateAvailable", { version: update.latest! })}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
