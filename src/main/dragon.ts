import https from "https";

import { getSetting } from "./db";

let championCache: Record<number, { name: string; key: string }> = {};
let augmentCache: Record<number, { name: string; desc: string; iconPath: string; rarity: string }> =
  {};

let championReady: Promise<void> | null = null;
let augmentReady: Promise<void> | null = null;
let gameDataVersion = "";

function getLanguage(): "zh" | "en" {
  const lang = getSetting("language");
  return lang === "en" ? "en" : "zh";
}

function parseAugmentName(aug: any, fallbackId: number, locale: "zh" | "en"): string {
  const name = aug.name || aug.nameTRA || aug.simpleNameTRA;
  if (typeof name === "string" && name.trim()) return name.trim();
  return locale === "zh" ? `强化 ${fallbackId}` : `Augment ${fallbackId}`;
}

function parseAugmentEntry(aug: any, id: number, locale: "zh" | "en") {
  return {
    name: parseAugmentName(aug, id, locale),
    desc: aug.desc || aug.descriptionTRA || "",
    iconPath: aug.augmentSmallIconPath || aug.iconSmall || aug.iconLarge || "",
    rarity: aug.rarity || "",
  };
}

const AUGMENT_DATA_BASE =
  "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global";

function forEachAugment(data: any, fn: (id: number, aug: any) => void) {
  if (Array.isArray(data)) {
    for (const aug of data) {
      fn(aug.id, aug);
    }
  } else if (typeof data === "object" && data !== null) {
    for (const [id, aug] of Object.entries(data)) {
      const numId = parseInt(id);
      if (!isNaN(numId)) fn(numId, aug);
    }
  }
}

function populateAugmentCache(data: any, locale: "zh" | "en", merge = false) {
  forEachAugment(data, (id, aug) => {
    if (merge && augmentCache[id]) return;
    augmentCache[id] = parseAugmentEntry(aug, id, locale);
  });
}

function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "MayhemTracker/1.0" } }, (res) => {
        // Follow redirects
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          fetchJson(res.headers.location).then(resolve).catch(reject);
          return;
        }
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

function getChampionLocale(): string {
  const lang = getSetting("language");
  return lang === "en" ? "en_US" : "zh_CN";
}

export function loadChampionData() {
  championReady = (async () => {
    try {
      const versions = await fetchJson("https://ddragon.leagueoflegends.com/api/versions.json");
      const version = versions[0];
      gameDataVersion = version;

      const locale = getChampionLocale();
      const data = await fetchJson(
        `https://ddragon.leagueoflegends.com/cdn/${version}/data/${locale}/champion.json`,
      );
      championCache = {};
      for (const [key, champ] of Object.entries(data.data) as any[]) {
        championCache[parseInt(champ.key)] = { name: champ.name, key };
      }
      console.log(
        `Loaded ${Object.keys(championCache).length} champions from Data Dragon v${version} (${locale})`,
      );
    } catch (err) {
      console.error("Failed to load champion data:", err);
    }
  })();
  return championReady;
}

export function loadAugmentData() {
  augmentReady = (async () => {
    try {
      const locale = getLanguage();
      const primaryRegion = locale === "zh" ? "zh_cn" : "default";

      augmentCache = {};

      const primary = await fetchJson(`${AUGMENT_DATA_BASE}/${primaryRegion}/v1/cherry-augments.json`);
      populateAugmentCache(primary, locale);

      // zh_cn may lag behind default — fill missing augments from English data
      if (locale === "zh") {
        const fallback = await fetchJson(`${AUGMENT_DATA_BASE}/default/v1/cherry-augments.json`);
        populateAugmentCache(fallback, "en", true);
      }

      console.log(
        `Loaded ${Object.keys(augmentCache).length} augments from CommunityDragon (${primaryRegion})`,
      );
    } catch (err) {
      console.error("Failed to load augment data:", err);
    }
  })();
  return augmentReady;
}

export async function waitForChampionData() {
  if (championReady) await championReady;
}

export async function waitForAugmentData() {
  if (augmentReady) await augmentReady;
}

export function getChampionData() {
  return championCache;
}

export function getAugmentDataCache() {
  return augmentCache;
}

export function getGameDataVersion() {
  return gameDataVersion;
}

export async function reloadGameData(): Promise<{
  version: string;
  champions: number;
  augments: number;
}> {
  championCache = {};
  augmentCache = {};
  championReady = null;
  augmentReady = null;

  loadChampionData();
  loadAugmentData();
  await Promise.all([waitForChampionData(), waitForAugmentData()]);

  return {
    version: gameDataVersion,
    champions: Object.keys(championCache).length,
    augments: Object.keys(augmentCache).length,
  };
}
