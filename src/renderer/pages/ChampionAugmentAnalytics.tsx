import { useState, useMemo, useEffect } from "react";
import { useIpc } from "../hooks/useIpc";
import {
  useChampionData,
  getChampionName,
  useAugmentData,
  getAugmentName,
} from "../hooks/useChampions";
import type { AnalyticsChampion, AugmentStats, ChampionStats } from "../lib/types";
import ChampionIcon from "../components/ChampionIcon";
import AugmentIcon from "../components/AugmentIcon";
import WinRateBar from "../components/WinRateBar";
import { useI18n } from "../hooks/useI18n";
import { usePatchVersion } from "../hooks/usePatchVersion";

type SortKey = "picks" | "winRate" | "name" | "delta";
type SortDir = "asc" | "desc";
type RarityFilter = "all" | "kSilver" | "kGold" | "kPrismatic";
type DataScope = "self" | "all";

const RARITY_LABEL: Record<string, string> = {
  kSilver: "silver",
  kGold: "gold",
  kPrismatic: "prismatic",
};

function winRate(wins: number, total: number): number {
  return total > 0 ? (wins / total) * 100 : 0;
}

export default function ChampionAugmentAnalytics() {
  const { t } = useI18n();
  const { patchFilter, ready } = usePatchVersion();
  const champData = useChampionData();
  const augmentData = useAugmentData();
  const [dataScope, setDataScope] = useState<DataScope>("self");

  const { data: selfChampions, loading: selfLoading, refetch: refetchSelf } = useIpc<ChampionStats[]>(
    () => window.api.getChampionStats(patchFilter),
    [patchFilter],
  );
  const {
    data: allChampions,
    loading: allLoading,
    refetch: refetchAll,
  } = useIpc<AnalyticsChampion[]>(
    () => window.api.getAllPlayersChampionStats(patchFilter),
    [patchFilter],
  );

  const champions: AnalyticsChampion[] | null =
    dataScope === "self"
      ? selfChampions?.map((c) => ({
          champion_id: c.champion_id,
          games: c.games,
          wins: c.wins,
        })) ?? null
      : allChampions;

  const loading = dataScope === "self" ? selfLoading : allLoading;

  const refetch = () => {
    refetchSelf();
    refetchAll();
  };

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [augStats, setAugStats] = useState<AugmentStats[] | null>(null);
  const [augLoading, setAugLoading] = useState(false);
  const [champSearch, setChampSearch] = useState("");
  const [augSearch, setAugSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("picks");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>("all");
  const [minPicks, setMinPicks] = useState(1);

  useEffect(() => {
    const unsub = window.api.onGamesUpdated(() => refetch());
    return unsub;
  }, [refetchSelf, refetchAll]);

  useEffect(() => {
    if (!champions || champions.length === 0) return;
    if (selectedId === null || !champions.some((c) => c.champion_id === selectedId)) {
      setSelectedId(champions[0].champion_id);
    }
  }, [champions, selectedId, dataScope]);

  useEffect(() => {
    if (selectedId === null || !ready) return;
    setAugLoading(true);
    const fetcher =
      dataScope === "self"
        ? window.api.getAugmentStats(selectedId, patchFilter)
        : window.api.getAllPlayersChampionAugmentStats(selectedId, patchFilter);
    fetcher.then(setAugStats).finally(() => setAugLoading(false));
  }, [selectedId, patchFilter, ready, dataScope]);

  useEffect(() => {
    const unsub = window.api.onGamesUpdated(() => {
      if (selectedId === null || !ready) return;
      const fetcher =
        dataScope === "self"
          ? window.api.getAugmentStats(selectedId, patchFilter)
          : window.api.getAllPlayersChampionAugmentStats(selectedId, patchFilter);
      fetcher.then(setAugStats);
    });
    return unsub;
  }, [selectedId, patchFilter, ready, dataScope]);

  const filteredChampions = useMemo(() => {
    if (!champions) return [];
    const q = champSearch.toLowerCase();
    return champions.filter((c) => {
      const name = getChampionName(
        champData,
        c.champion_id,
        t("championFallback", { id: c.champion_id }),
      ).toLowerCase();
      return name.includes(q);
    });
  }, [champions, champSearch, champData, t]);

  const selectedChampion = useMemo(
    () => champions?.find((c) => c.champion_id === selectedId) ?? null,
    [champions, selectedId],
  );

  const baselineWinRate = selectedChampion
    ? winRate(selectedChampion.wins, selectedChampion.games)
    : 0;

  const totalAugmentPicks = useMemo(() => {
    if (!augStats) return 0;
    return augStats.reduce((sum, a) => sum + a.picks, 0);
  }, [augStats]);

  const rarityFilters: { key: RarityFilter; label: string; activeColor: string }[] = [
    { key: "all", label: t("augments.all"), activeColor: "bg-lol-gold/20 text-lol-gold border-lol-gold/50" },
    {
      key: "kSilver",
      label: t("augments.silver"),
      activeColor: "bg-gray-400/20 text-gray-200 border-gray-400/50",
    },
    {
      key: "kGold",
      label: t("augments.gold"),
      activeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
    },
    {
      key: "kPrismatic",
      label: t("augments.prismatic"),
      activeColor: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/50",
    },
  ];

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  const sortedAugments = useMemo(() => {
    if (!augStats) return [];
    const q = augSearch.toLowerCase();

    let filtered = augStats.filter((a) => {
      if (a.picks < minPicks) return false;
      const aug = augmentData[a.augment_id];
      const name = getAugmentName(
        augmentData,
        a.augment_id,
        t("augments.fallback", { id: a.augment_id }),
      ).toLowerCase();
      if (!name.includes(q)) return false;
      if (rarityFilter !== "all" && aug?.rarity !== rarityFilter) return false;
      return true;
    });

    filtered.sort((a, b) => {
      if (sortKey === "name") {
        const nameA = getAugmentName(
          augmentData,
          a.augment_id,
          t("augments.fallback", { id: a.augment_id }),
        );
        const nameB = getAugmentName(
          augmentData,
          b.augment_id,
          t("augments.fallback", { id: b.augment_id }),
        );
        const cmp = nameA.localeCompare(nameB);
        return sortDir === "asc" ? cmp : -cmp;
      }

      let av: number;
      let bv: number;
      if (sortKey === "winRate") {
        av = winRate(a.wins, a.picks);
        bv = winRate(b.wins, b.picks);
      } else if (sortKey === "delta") {
        av = winRate(a.wins, a.picks) - baselineWinRate;
        bv = winRate(b.wins, b.picks) - baselineWinRate;
      } else {
        av = a.picks;
        bv = b.picks;
      }
      return sortDir === "desc" ? bv - av : av - bv;
    });

    return filtered;
  }, [augStats, augSearch, sortKey, sortDir, augmentData, rarityFilter, minPicks, baselineWinRate, t]);

  if (loading || !ready || !champions) {
    return <div className="text-lol-text text-center mt-20">{t("loading")}</div>;
  }

  if (champions.length === 0) {
    return (
      <div className="text-lol-text text-center mt-20 max-w-md mx-auto">
        {dataScope === "self" ? t("matchHistory.empty") : t("analytics.noAllPlayersData")}
      </div>
    );
  }

  const SortHeader = ({
    label,
    field,
    className,
  }: {
    label: string;
    field: SortKey;
    className?: string;
  }) => (
    <th
      onClick={() => handleSort(field)}
      className={`px-3 py-2 text-left text-xs font-medium text-lol-text uppercase tracking-wider cursor-pointer hover:text-lol-gold select-none ${className ?? ""}`}
    >
      {label} {sortKey === field ? (sortDir === "desc" ? "▼" : "▲") : ""}
    </th>
  );

  return (
    <div className="flex gap-4 h-[calc(100vh-4rem)] min-h-0">
      {/* Champion list */}
      <div className="w-56 shrink-0 flex flex-col bg-lol-card rounded-xl border border-lol-border overflow-hidden">
        <div className="p-3 border-b border-lol-border space-y-2">
          <h2 className="text-sm font-bold text-lol-text-bright">{t("analytics.selectChampion")}</h2>
          <input
            type="text"
            value={champSearch}
            onChange={(e) => setChampSearch(e.target.value)}
            placeholder={t("champions.search")}
            className="w-full bg-lol-dark border border-lol-border rounded-lg px-2.5 py-1.5 text-xs text-lol-text-bright placeholder:text-lol-text/50 focus:outline-none focus:border-lol-gold/50"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredChampions.map((c) => {
            const isSelected = c.champion_id === selectedId;
            const wr = winRate(c.wins, c.games);
            return (
              <button
                key={c.champion_id}
                onClick={() => setSelectedId(c.champion_id)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors border-b border-lol-border/30 ${
                  isSelected
                    ? "bg-lol-gold/15 border-l-2 border-l-lol-gold"
                    : "hover:bg-lol-card-hover"
                }`}
              >
                <ChampionIcon championId={c.champion_id} size={28} />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-lol-text-bright truncate">
                    {getChampionName(
                      champData,
                      c.champion_id,
                      t("championFallback", { id: c.champion_id }),
                    )}
                  </div>
                  <div className="text-[10px] text-lol-text">
                    {t("analytics.gamesWinRate", {
                      games: c.games,
                      winRate: wr.toFixed(1),
                    })}
                  </div>
                </div>
              </button>
            );
          })}
          {filteredChampions.length === 0 && (
            <div className="p-4 text-xs text-lol-text text-center">{t("champions.notFound")}</div>
          )}
        </div>
      </div>

      {/* Augment analytics */}
      <div className="flex-1 min-w-0 flex flex-col gap-3 overflow-hidden">
        <div className="flex items-center gap-2 shrink-0">
          {(
            [
              { key: "self" as const, label: t("analytics.scopeSelf") },
              { key: "all" as const, label: t("analytics.scopeAll") },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setDataScope(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                dataScope === key
                  ? "bg-lol-gold/20 text-lol-gold border-lol-gold/50"
                  : "text-lol-text border-lol-border hover:border-lol-border/80 bg-lol-card"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {selectedChampion && (
          <>
            <div className="flex items-center gap-4 shrink-0">
              <ChampionIcon championId={selectedChampion.champion_id} size={48} />
              <div>
                <h1 className="text-xl font-bold text-lol-text-bright">
                  {getChampionName(
                    champData,
                    selectedChampion.champion_id,
                    t("championFallback", { id: selectedChampion.champion_id }),
                  )}
                </h1>
                <p className="text-sm text-lol-text">
                  {dataScope === "self"
                    ? t("analytics.summary", {
                        games: selectedChampion.games,
                        winRate: baselineWinRate.toFixed(1),
                        augments: augStats?.length ?? 0,
                      })
                    : t("analytics.summaryAll", {
                        games: selectedChampion.games,
                        winRate: baselineWinRate.toFixed(1),
                        augments: augStats?.length ?? 0,
                      })}
                </p>
              </div>
              <div className="ml-auto w-40">
                <div className="text-[10px] text-lol-text uppercase mb-1">
                  {t("analytics.baseline")}
                </div>
                <WinRateBar wins={selectedChampion.wins} total={selectedChampion.games} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {rarityFilters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setRarityFilter(f.key)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors ${
                    rarityFilter === f.key
                      ? f.activeColor
                      : "text-lol-text border-lol-border hover:border-lol-border/80 bg-lol-card"
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-xs text-lol-text">{t("analytics.minPicks")}</span>
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    onClick={() => setMinPicks(n)}
                    className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                      minPicks === n
                        ? "bg-lol-gold/20 text-lol-gold border-lol-gold/50"
                        : "text-lol-text border-lol-border bg-lol-card"
                    }`}
                  >
                    {n}+
                  </button>
                ))}
              </div>
              <span className="text-xs text-lol-text ml-auto">
                {t("analytics.augmentCount", { count: sortedAugments.length })}
              </span>
              <input
                type="text"
                value={augSearch}
                onChange={(e) => setAugSearch(e.target.value)}
                placeholder={t("augments.search")}
                className="bg-lol-card border border-lol-border rounded-lg px-3 py-1 text-xs text-lol-text-bright placeholder:text-lol-text/50 focus:outline-none focus:border-lol-gold/50 w-44"
              />
            </div>

            <div className="flex-1 min-h-0 bg-lol-card rounded-xl border border-lol-border overflow-auto">
              {augLoading ? (
                <div className="py-12 text-center text-sm text-lol-text">{t("loading")}</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-lol-dark/50 sticky top-0 z-10">
                    <tr>
                      <SortHeader label={t("augments.augment")} field="name" />
                      <th className="px-3 py-2 text-left text-xs font-medium text-lol-text uppercase tracking-wider">
                        {t("analytics.rarity")}
                      </th>
                      <SortHeader label={t("augments.picks")} field="picks" />
                      <th className="px-3 py-2 text-left text-xs font-medium text-lol-text uppercase tracking-wider">
                        {t("augments.pickRate")}
                      </th>
                      <SortHeader label={t("augments.winRate")} field="winRate" className="w-36" />
                      <SortHeader label={t("analytics.vsBaseline")} field="delta" className="w-20" />
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAugments.map((a) => {
                      const aug = augmentData[a.augment_id];
                      const wr = winRate(a.wins, a.picks);
                      const delta = wr - baselineWinRate;
                      const pickRate =
                        totalAugmentPicks > 0
                          ? ((a.picks / totalAugmentPicks) * 100).toFixed(1)
                          : "0.0";
                      const rarityKey = aug?.rarity ? RARITY_LABEL[aug.rarity] : null;

                      return (
                        <tr
                          key={a.augment_id}
                          className="border-t border-lol-border/50 hover:bg-lol-card-hover transition-colors"
                        >
                          <td className="px-3 py-2">
                            <AugmentIcon augmentId={a.augment_id} showName />
                          </td>
                          <td className="px-3 py-2">
                            {rarityKey ? (
                              <span
                                className={`text-xs font-medium ${
                                  aug?.rarity === "kSilver"
                                    ? "text-gray-300"
                                    : aug?.rarity === "kGold"
                                      ? "text-yellow-400"
                                      : "text-fuchsia-400"
                                }`}
                              >
                                {t(`augments.${rarityKey}` as "augments.silver")}
                              </span>
                            ) : (
                              <span className="text-xs text-lol-text/50">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-sm text-lol-text-bright">{a.picks}</td>
                          <td className="px-3 py-2 text-sm text-lol-text">{pickRate}%</td>
                          <td className="px-3 py-2 w-36">
                            <WinRateBar wins={a.wins} total={a.picks} />
                          </td>
                          <td className="px-3 py-2 w-20">
                            <span
                              className={`text-xs font-medium ${
                                delta > 2
                                  ? "text-lol-win"
                                  : delta < -2
                                    ? "text-lol-loss"
                                    : "text-lol-text"
                              }`}
                            >
                              {delta > 0 ? "+" : ""}
                              {delta.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {!augLoading && sortedAugments.length === 0 && (
                <div className="py-12 text-center text-sm text-lol-text">{t("analytics.noAugments")}</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
