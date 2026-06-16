export type MatchHonor = "mvp" | "svp";

export interface HonorCandidate {
  participantId: number;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  totalDamageDealtToChampions: number;
  totalHeal: number;
  totalDamageTaken: number;
}

export function performanceScore(c: HonorCandidate): number {
  return (
    c.kills * 3 +
    c.assists * 2 -
    c.deaths * 1.2 +
    c.totalDamageDealtToChampions / 1200 +
    c.totalHeal / 2000 +
    c.totalDamageTaken / 3500
  );
}

function pickBest(candidates: HonorCandidate[]): HonorCandidate | null {
  if (candidates.length === 0) return null;
  return candidates.reduce((best, cur) => {
    const bestScore = performanceScore(best);
    const curScore = performanceScore(cur);
    if (curScore > bestScore) return cur;
    if (curScore < bestScore) return best;
    if (cur.totalDamageDealtToChampions !== best.totalDamageDealtToChampions) {
      return cur.totalDamageDealtToChampions > best.totalDamageDealtToChampions ? cur : best;
    }
    return cur.deaths < best.deaths ? cur : best;
  });
}

export function assignMatchHonors(candidates: HonorCandidate[]): Map<number, MatchHonor> {
  const honors = new Map<number, MatchHonor>();
  const mvp = pickBest(candidates.filter((c) => c.win));
  const svp = pickBest(candidates.filter((c) => !c.win));
  if (mvp) honors.set(mvp.participantId, "mvp");
  if (svp) honors.set(svp.participantId, "svp");
  return honors;
}

function toHonorCandidates(raw: any): HonorCandidate[] {
  return (raw.participants || []).map((p: any) => {
    const s = p.stats || p;
    return {
      participantId: p.participantId,
      win: !!s.win,
      kills: s.kills ?? 0,
      deaths: s.deaths ?? 0,
      assists: s.assists ?? 0,
      totalDamageDealtToChampions: s.totalDamageDealtToChampions ?? s.totalDamageDealt ?? 0,
      totalHeal: s.totalHeal ?? 0,
      totalDamageTaken: s.totalDamageTaken ?? 0,
    };
  });
}

export function extractHonorsFromRaw(raw: any): Map<number, MatchHonor> {
  if (!raw?.participants?.length) return new Map();
  return assignMatchHonors(toHonorCandidates(raw));
}

export function getSelfHonorFromRaw(raw: any, puuid: string | null): MatchHonor | null {
  if (!raw?.participants?.length || !puuid) return null;

  const honors = extractHonorsFromRaw(raw);
  const identities = raw.participantIdentities || [];

  for (const p of raw.participants) {
    const identity = identities.find((pi: any) => pi.participantId === p.participantId);
    const participantPuuid = p.puuid || identity?.player?.puuid;
    if (participantPuuid === puuid) {
      return honors.get(p.participantId) ?? null;
    }
  }

  return null;
}
