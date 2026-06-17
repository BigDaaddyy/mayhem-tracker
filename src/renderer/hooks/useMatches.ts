import { useState, useEffect, useCallback } from "react";
import type { MatchListItem } from "../lib/types";
import { usePatchVersion } from "./usePatchVersion";

const PAGE_SIZE = 20;

export function useMatches(championId?: number) {
  const { patchFilter, ready } = usePatchVersion();
  const [matches, setMatches] = useState<MatchListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  const load = useCallback(
    async (reset = false) => {
      if (!ready) return;
      setLoading(true);
      const offset = reset ? 0 : matches.length;
      try {
        const result =
          championId !== undefined
            ? await window.api.getChampionMatchHistory(
                championId,
                PAGE_SIZE,
                offset,
                patchFilter,
              )
            : await window.api.getMatchHistory(PAGE_SIZE, offset, patchFilter);
        if (reset) {
          setMatches(result.matches);
        } else {
          setMatches((prev) => [...prev, ...result.matches]);
        }
        setTotal(result.total);
        setHasMore(offset + result.matches.length < result.total);
      } finally {
        setLoading(false);
      }
    },
    [championId, matches.length, patchFilter, ready],
  );

  useEffect(() => {
    if (!ready) return;
    load(true);

    const unsub = window.api.onGamesUpdated(() => load(true));
    return unsub;
  }, [championId, patchFilter, ready]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) load(false);
  }, [loading, hasMore, load]);

  return {
    matches,
    total,
    loading: loading || !ready,
    hasMore,
    loadMore,
    reload: () => load(true),
  };
}
