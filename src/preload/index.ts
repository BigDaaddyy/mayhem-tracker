import { contextBridge, ipcRenderer } from "electron";

const api = {
  getMatchHistory: (limit: number, offset: number, patchVersion?: string) =>
    ipcRenderer.invoke("db:match-history", limit, offset, patchVersion),

  getMatchDetail: (gameId: number) => ipcRenderer.invoke("db:match-detail", gameId),

  getChampionStats: (patchVersion?: string) =>
    ipcRenderer.invoke("db:champion-stats", patchVersion),

  getAugmentStats: (championId?: number, patchVersion?: string) =>
    ipcRenderer.invoke("db:augment-stats", championId, patchVersion),

  getGamePatchVersions: () => ipcRenderer.invoke("db:game-patch-versions"),

  getAugmentStatsDetailed: (patchVersion?: string) =>
    ipcRenderer.invoke("db:augment-stats-detailed", patchVersion),

  getDashboard: (patchVersion?: string) => ipcRenderer.invoke("db:dashboard", patchVersion),

  getChampionMatchHistory: (
    championId: number,
    limit: number,
    offset: number,
    patchVersion?: string,
  ) => ipcRenderer.invoke("db:champion-match-history", championId, limit, offset, patchVersion),

  refreshGames: () => ipcRenderer.invoke("lcu:refresh"),

  getLcuStatus: () => ipcRenderer.invoke("lcu:status"),

  getChampionData: () => ipcRenderer.invoke("dragon:champions"),

  getAugmentData: () => ipcRenderer.invoke("dragon:augments"),

  getGameDataVersion: () => ipcRenderer.invoke("dragon:version"),

  reloadGameData: () => ipcRenderer.invoke("dragon:reload"),

  getChampionItemStats: (championId: number, patchVersion?: string) =>
    ipcRenderer.invoke("db:champion-item-stats", championId, patchVersion),

  getTeammateStats: (patchVersion?: string) =>
    ipcRenderer.invoke("db:teammate-stats", patchVersion),

  getGlobalStats: (patchVersion?: string) => ipcRenderer.invoke("db:global-stats", patchVersion),

  getAllPlayersChampionStats: (patchVersion?: string) =>
    ipcRenderer.invoke("db:all-players-champion-stats", patchVersion),

  getAllPlayersChampionAugmentStats: (championId: number, patchVersion?: string) =>
    ipcRenderer.invoke("db:all-players-champion-augment-stats", championId, patchVersion),

  getSummonerPuuid: () => ipcRenderer.invoke("db:summoner-puuid"),

  getAllSummonerPuuids: () => ipcRenderer.invoke("db:all-summoner-puuids"),

  onStatusChanged: (callback: (status: string) => void) => {
    const handler = (_event: any, status: string) => callback(status);
    ipcRenderer.on("lcu:status-changed", handler);
    return () => ipcRenderer.removeListener("lcu:status-changed", handler);
  },

  onGamesUpdated: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on("lcu:games-updated", handler);
    return () => ipcRenderer.removeListener("lcu:games-updated", handler);
  },

  onGameDataUpdated: (
    callback: (result: { version: string; champions: number; augments: number }) => void,
  ) => {
    const handler = (_event: any, result: { version: string; champions: number; augments: number }) =>
      callback(result);
    ipcRenderer.on("dragon:data-updated", handler);
    return () => ipcRenderer.removeListener("dragon:data-updated", handler);
  },

  getSetting: (key: string) => ipcRenderer.invoke("settings:get", key),

  setSetting: (key: string, value: string) => ipcRenderer.invoke("settings:set", key, value),

  exportData: () => ipcRenderer.invoke("data:export"),

  importData: () => ipcRenderer.invoke("data:import"),

  repairPuuids: () => ipcRenderer.invoke("data:repair-puuids"),

  getVersion: () => ipcRenderer.invoke("app:version"),

  checkForUpdate: () => ipcRenderer.invoke("app:check-update"),

  openUrl: (url: string) => ipcRenderer.invoke("app:open-url", url),
};

contextBridge.exposeInMainWorld("api", api);
