import { useState, useEffect } from "react";
import type { ChampionData, AugmentData } from "../lib/types";

let champCache: ChampionData | null = null;
let augCache: AugmentData | null = null;
let versionCache = "";

export function clearGameDataCache() {
  champCache = null;
  augCache = null;
  versionCache = "";
}

export function useGameDataVersion() {
  const [version, setVersion] = useState(versionCache);

  useEffect(() => {
    const load = () =>
      window.api.getGameDataVersion().then((v) => {
        if (v) versionCache = v;
        setVersion(v);
      });

    load();
    const unsub = window.api.onGameDataUpdated((result) => {
      versionCache = result.version;
      setVersion(result.version);
    });
    return unsub;
  }, []);

  return version;
}

export function useChampionData() {
  const [data, setData] = useState<ChampionData>(champCache || {});

  useEffect(() => {
    const load = () =>
      window.api.getChampionData().then((d) => {
        if (Object.keys(d).length > 0) champCache = d;
        setData(d);
      });

    load();
    const unsub = window.api.onGameDataUpdated(() => {
      clearGameDataCache();
      load();
    });
    return unsub;
  }, []);

  return data;
}

export function useAugmentData() {
  const [data, setData] = useState<AugmentData>(augCache || {});

  useEffect(() => {
    const load = () =>
      window.api.getAugmentData().then((d) => {
        if (Object.keys(d).length > 0) augCache = d;
        setData(d);
      });

    load();
    const unsub = window.api.onGameDataUpdated(() => {
      clearGameDataCache();
      load();
    });
    return unsub;
  }, []);

  return data;
}

export function getChampionName(data: ChampionData, id: number, fallback?: string): string {
  return data[id]?.name || fallback || `Champion ${id}`;
}

export function getAugmentName(data: AugmentData, id: number, fallback?: string): string {
  return data[id]?.name || fallback || `Augment ${id}`;
}
