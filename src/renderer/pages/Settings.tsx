import { useState, useEffect, useCallback } from "react";

export default function Settings() {
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

  const handleExport = useCallback(async () => {
    setExportStatus(null);
    try {
      const result = await window.api.exportData();
      if (result.success) {
        setExportStatus(`Exported to ${result.path}`);
      } else {
        setExportStatus(null);
      }
    } catch (err: any) {
      setExportStatus(`Error: ${err.message}`);
    }
  }, []);

  const handleImport = useCallback(async () => {
    setImportStatus(null);
    try {
      const result = await window.api.importData();
      if (result.success) {
        setImportStatus(`Imported ${result.imported} new game(s)`);
      } else {
        setImportStatus(null);
      }
    } catch (err: any) {
      setImportStatus(`Error: ${err.message}`);
    }
  }, []);

  const handleRepair = useCallback(async () => {
    setRepairStatus(null);
    try {
      const result = await window.api.repairPuuids();
      setRepairStatus(
        `Repaired ${result.repairedGames} game(s), found ${result.discoveredAccounts} account(s)`,
      );
    } catch (err: any) {
      setRepairStatus(`Error: ${err.message}`);
    }
  }, []);

  const handleRefreshGameData = useCallback(async () => {
    setGameDataRefreshing(true);
    setGameDataStatus(null);
    try {
      const result = await window.api.reloadGameData();
      setGameDataVersion(result.version);
      setGameDataStatus(
        `Updated to patch ${result.version}: ${result.champions} champions, ${result.augments} augments`,
      );
    } catch (err: any) {
      setGameDataStatus(`Error: ${err.message}`);
    } finally {
      setGameDataRefreshing(false);
    }
  }, []);

  if (loading) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-lol-text-bright">Settings</h1>

      {/* Exit Behavior */}
      <div className="bg-lol-card rounded-xl border border-lol-border p-5">
        <h2 className="text-sm font-semibold text-lol-text-bright mb-4">Exit Behavior</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-lol-text-bright">Minimize to tray on close</p>
            <p className="text-xs text-lol-text mt-0.5">
              When enabled, the program can keep storing your games even when the window is closed.
              You can still close the program from the system tray.
            </p>
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

      {/* Game Data */}
      <div className="bg-lol-card rounded-xl border border-lol-border p-5">
        <h2 className="text-sm font-semibold text-lol-text-bright mb-4">Game Data</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-lol-text-bright">Refresh champions, augments &amp; items</p>
              <p className="text-xs text-lol-text mt-0.5">
                Fetches the latest names and icons from Riot / CommunityDragon.
                {gameDataVersion ? ` Current patch data: ${gameDataVersion}.` : ""}
              </p>
            </div>
            <button
              onClick={handleRefreshGameData}
              disabled={gameDataRefreshing}
              className="px-4 py-1.5 rounded text-sm bg-lol-gold/20 text-lol-gold hover:bg-lol-gold/30 disabled:opacity-50 transition-colors"
            >
              {gameDataRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          {gameDataStatus && <p className="text-xs text-lol-text">{gameDataStatus}</p>}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-lol-card rounded-xl border border-lol-border p-5">
        <h2 className="text-sm font-semibold text-lol-text-bright mb-4">Data Management</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-lol-text-bright">Export data</p>
              <p className="text-xs text-lol-text mt-0.5">
                Save all match data to a JSON file for backup
              </p>
            </div>
            <button
              onClick={handleExport}
              className="px-4 py-1.5 rounded text-sm bg-lol-gold/20 text-lol-gold hover:bg-lol-gold/30 transition-colors"
            >
              Export
            </button>
          </div>
          {exportStatus && <p className="text-xs text-lol-text">{exportStatus}</p>}

          <div className="border-t border-lol-border" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-lol-text-bright">Import data</p>
              <p className="text-xs text-lol-text mt-0.5">
                Load match data from a previously exported file
              </p>
            </div>
            <button
              onClick={handleImport}
              className="px-4 py-1.5 rounded text-sm bg-lol-gold/20 text-lol-gold hover:bg-lol-gold/30 transition-colors"
            >
              Import
            </button>
          </div>
          {importStatus && <p className="text-xs text-lol-text">{importStatus}</p>}

          <div className="border-t border-lol-border" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-lol-text-bright">Repair account data</p>
              <p className="text-xs text-lol-text mt-0.5">
                Re-detect which accounts are yours by analyzing game history. Use this if games are
                attributed to the wrong account.
              </p>
            </div>
            <button
              onClick={handleRepair}
              className="px-4 py-1.5 rounded text-sm bg-lol-gold/20 text-lol-gold hover:bg-lol-gold/30 transition-colors"
            >
              Repair
            </button>
          </div>
          {repairStatus && <p className="text-xs text-lol-text">{repairStatus}</p>}
        </div>
      </div>
    </div>
  );
}
