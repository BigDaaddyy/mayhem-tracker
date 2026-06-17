import { ipcMain, BrowserWindow, dialog, app, shell } from "electron";

import fs from "fs";

import * as db from "./db";

import * as lcu from "./lcu";

import * as dragon from "./dragon";



export function registerIpcHandlers(win: BrowserWindow) {

  ipcMain.handle(

    "db:match-history",

    (_event, limit: number, offset: number, patchVersion?: string) => {

      return db.getMatchHistory(limit, offset, patchVersion);

    },

  );



  ipcMain.handle("db:match-detail", (_event, gameId: number) => {

    return db.getMatchDetail(gameId);

  });



  ipcMain.handle("db:champion-stats", (_event, patchVersion?: string) => {

    return db.getChampionStatsAll(patchVersion);

  });



  ipcMain.handle("db:augment-stats", (_event, championId?: number, patchVersion?: string) => {

    return db.getAugmentStatsAll(championId, patchVersion);

  });



  ipcMain.handle("db:game-patch-versions", () => {

    return db.getGamePatchVersions();

  });



  ipcMain.handle("db:augment-stats-detailed", (_event, patchVersion?: string) => {

    return db.getAugmentStatsWithChampions(patchVersion);

  });



  ipcMain.handle("db:dashboard", (_event, patchVersion?: string) => {

    return db.getDashboardData(patchVersion);

  });



  ipcMain.handle(

    "db:champion-match-history",

    (_event, championId: number, limit: number, offset: number, patchVersion?: string) => {

      return db.getChampionMatchHistory(championId, limit, offset, patchVersion);

    },

  );



  ipcMain.handle("lcu:refresh", async () => {

    return lcu.fetchNewGames(win);

  });



  ipcMain.handle("lcu:status", () => {

    return lcu.getStatus();

  });



  ipcMain.handle("dragon:champions", async () => {

    await dragon.waitForChampionData();

    return dragon.getChampionData();

  });



  ipcMain.handle("dragon:augments", async () => {

    await dragon.waitForAugmentData();

    return dragon.getAugmentDataCache();

  });



  ipcMain.handle("dragon:version", () => {

    return dragon.getGameDataVersion();

  });



  ipcMain.handle("dragon:reload", async () => {

    const result = await dragon.reloadGameData();

    if (!win.isDestroyed()) {

      win.webContents.send("dragon:data-updated", result);

    }

    return result;

  });



  ipcMain.handle("db:champion-item-stats", (_event, championId: number, patchVersion?: string) => {

    return db.getChampionItemStats(championId, patchVersion);

  });



  ipcMain.handle("db:teammate-stats", (_event, patchVersion?: string) => {

    return db.getTeammateStats(patchVersion);

  });



  ipcMain.handle("db:global-stats", (_event, patchVersion?: string) => {

    return db.getGlobalStats(patchVersion);

  });



  ipcMain.handle("db:all-summoner-puuids", () => {

    return db.getAllPuuids();

  });



  ipcMain.handle("db:summoner-puuid", () => {

    const s = db.getSummoner();

    return s?.puuid ?? null;

  });



  // Settings

  ipcMain.handle("settings:get", (_event, key: string) => {

    return db.getSetting(key);

  });



  ipcMain.handle("settings:set", (_event, key: string, value: string) => {

    db.setSetting(key, value);

  });



  // Version & updates

  ipcMain.handle("app:version", () => {

    return app.getVersion();

  });



  ipcMain.handle("app:check-update", async () => {

    try {

      const res = await fetch(

        "https://api.github.com/repos/BigDaaddyy/mayhem-tracker/releases/latest",

        { headers: { "User-Agent": "mayhem-tracker" } },

      );

      if (!res.ok) return { hasUpdate: false, error: "No releases found" };

      const data = await res.json();

      const latest = (data.tag_name as string).replace(/^v/, "");

      const current = app.getVersion();

      return {

        hasUpdate: latest !== current,

        latest,

        current,

        url: data.html_url as string,

      };

    } catch {

      return { hasUpdate: false, error: "Failed to check for updates" };

    }

  });



  ipcMain.handle("app:open-url", (_event, url: string) => {

    shell.openExternal(url);

  });



  // Data export/import

  ipcMain.handle("data:export", async () => {

    const result = await dialog.showSaveDialog(win, {

      title: "Export Mayhem Data",

      defaultPath: `mayhem-backup-${new Date().toISOString().slice(0, 10)}.json`,

      filters: [{ name: "JSON", extensions: ["json"] }],

    });

    if (result.canceled || !result.filePath) return { success: false };

    const data = db.exportAllData();

    fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2));

    return { success: true, path: result.filePath };

  });



  ipcMain.handle("data:import", async () => {

    const result = await dialog.showOpenDialog(win, {

      title: "Import Mayhem Data",

      filters: [{ name: "JSON", extensions: ["json"] }],

      properties: ["openFile"],

    });

    if (result.canceled || !result.filePaths[0]) return { success: false };

    const raw = fs.readFileSync(result.filePaths[0], "utf-8");

    const data = JSON.parse(raw);

    const imported = db.importData(data);

    return { success: true, imported };

  });



  ipcMain.handle("data:repair-puuids", () => {

    return db.repairPuuids();

  });

}

