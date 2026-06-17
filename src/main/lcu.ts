import {
  authenticate,
  createHttp1Request,
  createWebSocketConnection,
  type Credentials,
  type HttpRequestOptions,
  type LeagueWebSocket,
} from "league-connect";
import { BrowserWindow } from "electron";
import * as db from "./db";

let credentials: Credentials | null = null;
let status: "disconnected" | "connecting" | "connected" = "disconnected";
let pollTimer: ReturnType<typeof setInterval> | null = null;
let connectTimer: ReturnType<typeof setInterval> | null = null;
let lcuWs: LeagueWebSocket | null = null;
let winRef: BrowserWindow | null = null;
let fetchAfterGameTimer: ReturnType<typeof setTimeout> | null = null;
let fetchAfterGameInProgress = false;
let wsReconnectTimer: ReturnType<typeof setTimeout> | null = null;

const END_GAME_PHASES = new Set(["PreEndOfGame", "EndOfGame", "WaitingForStats"]);
const POST_GAME_FETCH_DELAYS_MS = [0, 3000, 8000, 15000];

function setStatus(newStatus: typeof status, win?: BrowserWindow | null) {
  status = newStatus;
  if (win && !win.isDestroyed()) {
    win.webContents.send("lcu:status-changed", status);
  }
}

export function getStatus() {
  return status;
}

async function connect(): Promise<Credentials> {
  credentials = await authenticate({ windowsShell: "powershell" });
  return credentials;
}

async function lcuRequest(url: string, method: HttpRequestOptions["method"] = "GET") {
  if (!credentials) {
    await connect();
  }
  const response = await createHttp1Request({ url, method }, credentials!);
  if (!response.ok) {
    throw new Error(`LCU request failed: ${response.status} ${url}`);
  }
  return response.json();
}

async function fetchCurrentSummoner(): Promise<any> {
  return lcuRequest("/lol-summoner/v1/current-summoner");
}

async function fetchMatchHistoryByPuuid(puuid: string, begIndex = 0, endIndex = 19): Promise<any> {
  return lcuRequest(
    `/lol-match-history/v1/products/lol/${puuid}/matches?begIndex=${begIndex}&endIndex=${endIndex}`,
  );
}

async function fetchMatchHistory(begIndex = 0, endIndex = 19): Promise<any> {
  return lcuRequest(
    `/lol-match-history/v1/products/lol/current-summoner/matches?begIndex=${begIndex}&endIndex=${endIndex}`,
  );
}

async function fetchGameDetails(gameId: number): Promise<any> {
  return lcuRequest(`/lol-match-history/v1/games/${gameId}`);
}

export async function fetchNewGames(
  win?: BrowserWindow | null,
): Promise<{ newGames: number; totalGames: number }> {
  await connect();

  const summoner = await fetchCurrentSummoner();
  db.upsertSummoner(summoner);

  let newGamesCount = 0;

  let historyResponse: any;
  try {
    historyResponse = await fetchMatchHistoryByPuuid(summoner.puuid, 0, 19);
  } catch {
    try {
      historyResponse = await fetchMatchHistory(0, 19);
    } catch {
      return { newGames: 0, totalGames: 0 };
    }
  }

  const games = historyResponse.games?.games || historyResponse.games || [];

  for (const game of games) {
    if (db.gameExists(game.gameId)) continue;
    if (game.queueId !== 2400) continue;

    let fullGame: any;
    try {
      fullGame = await fetchGameDetails(game.gameId);
    } catch {
      fullGame = game;
    }

    const inserted = db.insertGameFull(fullGame, summoner.puuid);
    if (inserted) {
      newGamesCount++;
      console.log(`Stored ARAM Mayhem game ${fullGame.gameId}`);
    }
  }

  if (newGamesCount > 0 && win && !win.isDestroyed()) {
    win.webContents.send("lcu:games-updated");
  }

  const dashboard = db.getDashboardData();
  return { newGames: newGamesCount, totalGames: dashboard.totalGames };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchNewGamesWithRetry(win: BrowserWindow): Promise<void> {
  if (fetchAfterGameInProgress) return;
  fetchAfterGameInProgress = true;

  try {
    for (const delay of POST_GAME_FETCH_DELAYS_MS) {
      if (delay > 0) await sleep(delay);
      try {
        const result = await fetchNewGames(win);
        if (result.newGames > 0) {
          console.log("Auto-fetched new game after match end");
          return;
        }
      } catch (err) {
        console.log("Post-game fetch retry error:", err);
      }
    }
  } finally {
    fetchAfterGameInProgress = false;
  }
}

function scheduleFetchAfterGameEnd(win: BrowserWindow): void {
  if (fetchAfterGameTimer) clearTimeout(fetchAfterGameTimer);
  fetchAfterGameTimer = setTimeout(() => {
    fetchAfterGameTimer = null;
    void fetchNewGamesWithRetry(win);
  }, 500);
}

function setupWebSocketHandlers(ws: LeagueWebSocket, win: BrowserWindow): void {
  ws.subscribe("lol-gameflow/v1/gameflow-phase", (phase) => {
    if (typeof phase === "string" && END_GAME_PHASES.has(phase)) {
      console.log(`Game ended (phase: ${phase}), scheduling fetch`);
      scheduleFetchAfterGameEnd(win);
    }
  });

  ws.subscribe("lol-end-of-game/v1/eog-stats-block", (data) => {
    if (data && typeof data === "object") {
      console.log("End-of-game stats received, scheduling fetch");
      scheduleFetchAfterGameEnd(win);
    }
  });

  ws.on("close", () => {
    lcuWs = null;
    if (status === "connected" && winRef && !winRef.isDestroyed()) {
      if (wsReconnectTimer) clearTimeout(wsReconnectTimer);
      wsReconnectTimer = setTimeout(() => {
        wsReconnectTimer = null;
        void connectWebSocket(winRef!);
      }, 3000);
    }
  });
}

async function connectWebSocket(win: BrowserWindow): Promise<void> {
  stopWebSocket();

  try {
    const ws = await createWebSocketConnection({
      authenticationOptions: { windowsShell: "powershell" },
      maxRetries: 3,
    });
    lcuWs = ws;
    setupWebSocketHandlers(ws, win);
    console.log("LCU WebSocket connected");
  } catch (err) {
    console.log("LCU WebSocket connection failed:", err);
  }
}

function stopWebSocket(): void {
  if (wsReconnectTimer) {
    clearTimeout(wsReconnectTimer);
    wsReconnectTimer = null;
  }
  if (lcuWs) {
    try {
      lcuWs.removeAllListeners("close");
      lcuWs.close();
    } catch {
      /* ignore */
    }
    lcuWs = null;
  }
}

export function startPolling(win: BrowserWindow, firstAttempt = true) {
  winRef = win;
  setStatus(firstAttempt ? "connecting" : "disconnected", win);

  connectTimer = setInterval(async () => {
    try {
      await connect();
      setStatus("connected", win);
      if (connectTimer) {
        clearInterval(connectTimer);
        connectTimer = null;
      }

      await fetchNewGames(win);
      void connectWebSocket(win);

      pollTimer = setInterval(async () => {
        try {
          await fetchNewGames(win);
        } catch (err) {
          console.log("Poll fetch error:", err);
          stopWebSocket();
          if (pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
          }
          startPolling(win, false);
        }
      }, 60000);
    } catch {
      if (firstAttempt) {
        firstAttempt = false;
        setStatus("disconnected", win);
      }
    }
  }, 5000);
}

export function stopPolling() {
  if (fetchAfterGameTimer) {
    clearTimeout(fetchAfterGameTimer);
    fetchAfterGameTimer = null;
  }
  fetchAfterGameInProgress = false;
  stopWebSocket();
  winRef = null;

  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  if (connectTimer) {
    clearInterval(connectTimer);
    connectTimer = null;
  }
}
