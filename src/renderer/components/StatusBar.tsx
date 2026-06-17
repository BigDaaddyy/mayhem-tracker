import { useI18n } from "../hooks/useI18n";
import { usePatchVersion } from "../hooks/usePatchVersion";

export default function StatusBar() {
  const { t } = useI18n();
  const { patchVersion, setPatchVersion, versions, ready } = usePatchVersion();

  const selectedGames =
    patchVersion === "all"
      ? versions.reduce((sum, v) => sum + v.games, 0)
      : (versions.find((v) => v.version === patchVersion)?.games ?? 0);

  return (
    <div className="titlebar-drag h-9 bg-lol-card border-b border-lol-border shrink-0 flex items-center justify-start pl-4 pr-36 gap-2">
      {ready && (
        <>
          <span className="text-xs text-lol-text titlebar-no-drag">{t("analytics.patch")}</span>
          <select
            value={patchVersion}
            onChange={(e) => void setPatchVersion(e.target.value)}
            className="titlebar-no-drag bg-lol-dark border border-lol-border rounded-md px-2 py-0.5 text-xs text-lol-text-bright focus:outline-none focus:border-lol-gold/50 min-w-32"
          >
            <option value="all">{t("analytics.allPatches")}</option>
            {versions.map((v) => (
              <option key={v.version} value={v.version}>
                {v.version === "unknown" ? t("analytics.unknownPatch") : v.version} ({v.games})
              </option>
            ))}
          </select>
          <span className="text-[10px] text-lol-text/60 titlebar-no-drag">
            {t("times", { count: selectedGames })}
          </span>
        </>
      )}
    </div>
  );
}
