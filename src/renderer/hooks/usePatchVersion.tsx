import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { PatchVersionStats } from "../lib/types";

interface PatchVersionContextValue {
  patchVersion: string;
  patchFilter: string | undefined;
  versions: PatchVersionStats[];
  ready: boolean;
  setPatchVersion: (version: string) => Promise<void>;
  refetchVersions: () => Promise<void>;
}

const PatchVersionContext = createContext<PatchVersionContextValue | null>(null);

export function PatchVersionProvider({ children }: { children: ReactNode }) {
  const [patchVersion, setPatchVersionState] = useState("all");
  const [versions, setVersions] = useState<PatchVersionStats[]>([]);
  const [ready, setReady] = useState(false);

  const refetchVersions = useCallback(async () => {
    const list = await window.api.getGamePatchVersions();
    setVersions(list);
  }, []);

  useEffect(() => {
    async function init() {
      const [saved, list] = await Promise.all([
        window.api.getSetting("selected_patch"),
        window.api.getGamePatchVersions(),
      ]);
      setVersions(list);

      if (saved && (saved === "all" || list.some((v) => v.version === saved))) {
        setPatchVersionState(saved);
      } else {
        const latest = list.find((v) => v.version !== "unknown");
        setPatchVersionState(latest?.version ?? "all");
      }
      setReady(true);
    }
    void init();
  }, []);

  useEffect(() => {
    const unsub = window.api.onGamesUpdated(() => {
      void refetchVersions();
    });
    return unsub;
  }, [refetchVersions]);

  const setPatchVersion = useCallback(async (version: string) => {
    setPatchVersionState(version);
    await window.api.setSetting("selected_patch", version);
  }, []);

  const patchFilter = patchVersion === "all" ? undefined : patchVersion;

  return (
    <PatchVersionContext.Provider
      value={{ patchVersion, patchFilter, versions, ready, setPatchVersion, refetchVersions }}
    >
      {children}
    </PatchVersionContext.Provider>
  );
}

export function usePatchVersion(): PatchVersionContextValue {
  const ctx = useContext(PatchVersionContext);
  if (!ctx) throw new Error("usePatchVersion must be used within PatchVersionProvider");
  return ctx;
}
