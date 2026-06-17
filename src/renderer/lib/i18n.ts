export type Locale = "zh" | "en";

export const messages = {
  zh: {
    appTitle: "MAYHEM TRACKER",
    nav: {
      matchHistory: "对局记录",
      champions: "英雄",
      augments: "强化符文",
      analytics: "数据分析",
      friends: "队友",
      global: "全局统计",
      settings: "设置",
    },
    status: {
      connected: "已连接",
      connecting: "连接中…",
      disconnected: "未连接",
    },
    sync: "同步",
    syncTitle: "从客户端同步对局记录",
    data: "资源",
    dataTitle: "更新英雄、强化符文与装备图标",
    patchData: "版本数据：{version}",
    updateAvailable: "v{version} 可更新",
    syncFoundGames: "发现 {count} 场新对局",
    syncNoGames: "没有新对局",
    syncGameData: "资源已更新 v{version}（{augments} 个强化）",
    error: "错误：{message}",
    dataError: "资源错误：{message}",

    loading: "加载中…",
    noData: "暂无数据",
    noGames: "暂无对局",
    times: "{count} 次",

    settings: {
      title: "设置",
      language: "界面语言",
      languageDesc: "切换后英雄名称将同步更新为对应语言",
      zh: "简体中文",
      en: "English",
      exitBehavior: "退出行为",
      minimizeToTray: "关闭时最小化到托盘",
      minimizeToTrayDesc:
        "开启后关闭窗口不会退出程序，可继续在后台记录对局。可从系统托盘完全退出。",
      gameData: "游戏资源",
      refreshGameData: "刷新英雄、强化与装备",
      refreshGameDataDesc:
        "从 Riot / CommunityDragon 获取最新名称与图标。{patch}",
      currentPatch: "当前版本：{version}。",
      refreshing: "刷新中…",
      refresh: "刷新",
      gameDataUpdated:
        "已更新至版本 {version}：{champions} 名英雄，{augments} 个强化符文",
      dataManagement: "数据管理",
      export: "导出数据",
      exportDesc: "将所有对局数据备份为 JSON 文件",
      import: "导入数据",
      importDesc: "从先前导出的文件恢复对局数据",
      repair: "修复账号数据",
      repairDesc: "通过分析对局历史重新识别你的账号。若对局归属错误可使用此功能。",
      exportedTo: "已导出至 {path}",
      importedGames: "已导入 {count} 场新对局",
      repaired: "已修复 {games} 场对局，识别到 {accounts} 个账号",
    },

    matchHistory: {
      title: "对局记录",
      totalGames: "总场次",
      winRate: "胜率",
      avgKda: "场均 KDA",
      multikills: "连杀",
      gamesCount: "{count} 场",
      empty:
        "未找到符文大乱斗对局。请连接英雄联盟客户端并点击「同步」。",
      win: "胜利",
      loss: "失败",
      remake: "重开",
      kda: "KDA",
      dmg: "伤害",
      taken: "承伤",
      heal: "治疗",
      noGameData: "完整对局数据不可用。",
      team: "队伍 {team}",
      victory: "胜利",
      defeat: "失败",
      player: "召唤师",
      damage: "造成伤害",
      gold: "金币",
      items: "装备",
      augments: "强化符文",
      multikillShort: { d: "双", t: "三", q: "四", p: "五" },
    },

    champions: {
      title: "英雄",
      search: "搜索英雄…",
      champion: "英雄",
      games: "场次",
      winRate: "胜率",
      avgK: "场均击杀",
      avgD: "场均死亡",
      avgA: "场均助攻",
      avgDmg: "场均伤害",
      avgGold: "场均金币",
      multikills: "连杀",
      topAugments: "常用强化",
      topItems: "常用装备",
      recentGames: "最近对局",
      notFound: "未找到英雄",
      augmentFallback: "强化 {id}",
    },

    augments: {
      title: "强化符文",
      all: "全部",
      silver: "白银",
      gold: "黄金",
      prismatic: "棱彩",
      count: "{count} 个强化",
      search: "搜索强化…",
      augment: "强化",
      picks: "选取",
      pickRate: "选取率",
      winRate: "胜率",
      notFound: "未找到强化",
      fallback: "强化 {id}",
    },

    analytics: {
      selectChampion: "选择英雄",
      gamesWinRate: "{games} 场 · {winRate}%",
      summary: "{games} 场对局 · 英雄胜率 {winRate}% · {augments} 种强化",
      baseline: "英雄基准胜率",
      rarity: "品质",
      vsBaseline: "对比基准",
      minPicks: "最少场次",
      augmentCount: "{count} 个强化",
      noAugments: "暂无符合条件的强化数据",
      patch: "游戏版本",
      allPatches: "全部版本",
      unknownPatch: "未知版本",
    },

    friends: {
      title: "队友",
      players: "{count} 名玩家",
      search: "搜索召唤师…",
      player: "召唤师",
      games: "同场",
      winRate: "胜率",
      theirKda: "场均 KDA",
      topChampions: "常用英雄",
      lastPlayed: "最近同场",
      notFound: "未找到玩家",
    },

    global: {
      title: "全局统计",
      summary: "{games} 场 · {champions} 名英雄 · {augments} 个强化",
      tabChampions: "英雄",
      tabAugments: "强化符文",
      championsCount: "{count} 名英雄",
      augmentsCount: "{count} 个强化",
      searchChampion: "搜索英雄…",
      searchAugment: "搜索强化…",
      champion: "英雄",
      games: "出场",
      pickRate: "出场率",
      winRate: "胜率",
      augment: "强化",
      picks: "选取",
      notFoundChampions: "未找到英雄",
      notFoundAugments: "未找到强化",
    },

    multikill: {
      double: "双杀",
      triple: "三杀",
      quadra: "四杀",
      penta: "五杀",
    },

    honor: {
      mvp: "MVP",
      svp: "SVP",
      mvpTitle: "全场最佳（胜方）",
      svpTitle: "败方最佳",
    },

    kdaPerfect: "完美",
    championFallback: "英雄 {id}",
  },
  en: {
    appTitle: "MAYHEM TRACKER",
    nav: {
      matchHistory: "Match History",
      champions: "Champions",
      augments: "Augments",
      analytics: "Analytics",
      friends: "Friends",
      global: "Total Stats",
      settings: "Settings",
    },
    status: {
      connected: "Connected",
      connecting: "Connecting...",
      disconnected: "Disconnected",
    },
    sync: "Sync",
    syncTitle: "Sync match history from League client",
    data: "Data",
    dataTitle: "Update champions, augments & item icons",
    patchData: "Patch data: {version}",
    updateAvailable: "v{version} available",
    syncFoundGames: "Found {count} new game(s)",
    syncNoGames: "No new games",
    syncGameData: "Game data v{version} ({augments} augments)",
    error: "Error: {message}",
    dataError: "Data error: {message}",

    loading: "Loading...",
    noData: "No data",
    noGames: "No games",
    times: "{count}x",

    settings: {
      title: "Settings",
      language: "Language",
      languageDesc: "Champion names update to match the selected language",
      zh: "简体中文",
      en: "English",
      exitBehavior: "Exit Behavior",
      minimizeToTray: "Minimize to tray on close",
      minimizeToTrayDesc:
        "When enabled, the program can keep storing your games even when the window is closed. You can still close the program from the system tray.",
      gameData: "Game Data",
      refreshGameData: "Refresh champions, augments & items",
      refreshGameDataDesc:
        "Fetches the latest names and icons from Riot / CommunityDragon. {patch}",
      currentPatch: "Current patch data: {version}.",
      refreshing: "Refreshing...",
      refresh: "Refresh",
      gameDataUpdated:
        "Updated to patch {version}: {champions} champions, {augments} augments",
      dataManagement: "Data Management",
      export: "Export data",
      exportDesc: "Save all match data to a JSON file for backup",
      import: "Import data",
      importDesc: "Load match data from a previously exported file",
      repair: "Repair account data",
      repairDesc:
        "Re-detect which accounts are yours by analyzing game history. Use this if games are attributed to the wrong account.",
      exportedTo: "Exported to {path}",
      importedGames: "Imported {count} new game(s)",
      repaired: "Repaired {games} game(s), found {accounts} account(s)",
    },

    matchHistory: {
      title: "Match History",
      totalGames: "Total Games",
      winRate: "Win Rate",
      avgKda: "Avg KDA",
      multikills: "Multikills",
      gamesCount: "{count} games",
      empty: "No ARAM Mayhem games found. Connect to the League client and click Sync.",
      win: "WIN",
      loss: "LOSS",
      remake: "RMK",
      kda: "KDA",
      dmg: "DMG",
      taken: "TKN",
      heal: "HEL",
      noGameData: "Full game data not available.",
      team: "Team {team}",
      victory: "Victory",
      defeat: "Defeat",
      player: "Player",
      damage: "Damage",
      gold: "Gold",
      items: "Items",
      augments: "Augments",
      multikillShort: { d: "D", t: "T", q: "Q", p: "P" },
    },

    champions: {
      title: "Champions",
      search: "Search champion...",
      champion: "Champion",
      games: "Games",
      winRate: "Win Rate",
      avgK: "Avg K",
      avgD: "Avg D",
      avgA: "Avg A",
      avgDmg: "Avg Dmg",
      avgGold: "Avg Gold",
      multikills: "Multikills",
      topAugments: "Top Augments",
      topItems: "Top Items",
      recentGames: "Recent Games",
      notFound: "No champions found",
      augmentFallback: "Augment {id}",
    },

    augments: {
      title: "Augments",
      all: "All",
      silver: "Silver",
      gold: "Gold",
      prismatic: "Prismatic",
      count: "{count} augments",
      search: "Search augment...",
      augment: "Augment",
      picks: "Picks",
      pickRate: "Pick Rate",
      winRate: "Win Rate",
      notFound: "No augments found",
      fallback: "Augment {id}",
    },

    analytics: {
      selectChampion: "Select Champion",
      gamesWinRate: "{games} games · {winRate}%",
      summary: "{games} games · {winRate}% champ WR · {augments} augments",
      baseline: "Champion Baseline",
      rarity: "Rarity",
      vsBaseline: "vs Baseline",
      minPicks: "Min picks",
      augmentCount: "{count} augments",
      noAugments: "No augments match the current filters",
      patch: "Patch",
      allPatches: "All patches",
      unknownPatch: "Unknown",
    },

    friends: {
      title: "Friends",
      players: "{count} players",
      search: "Search player...",
      player: "Player",
      games: "Games",
      winRate: "Win Rate",
      theirKda: "Their KDA",
      topChampions: "Top Champions",
      lastPlayed: "Last Played",
      notFound: "No players found",
    },

    global: {
      title: "Total Stats",
      summary: "{games} games · {champions} champions · {augments} augments",
      tabChampions: "Champions",
      tabAugments: "Augments",
      championsCount: "{count} champions",
      augmentsCount: "{count} augments",
      searchChampion: "Search champion...",
      searchAugment: "Search augment...",
      champion: "Champion",
      games: "Games",
      pickRate: "Pick Rate",
      winRate: "Win Rate",
      augment: "Augment",
      picks: "Picks",
      notFoundChampions: "No champions found",
      notFoundAugments: "No augments found",
    },

    multikill: {
      double: "DOUBLE",
      triple: "TRIPLE",
      quadra: "QUADRA",
      penta: "PENTA",
    },

    honor: {
      mvp: "MVP",
      svp: "SVP",
      mvpTitle: "Most Valuable Player (winning team)",
      svpTitle: "Second Valuable Player (losing team)",
    },

    kdaPerfect: "Perfect",
    championFallback: "Champion {id}",
  },
} as const;

type NestedKeys<T, P extends string = ""> = T extends string
  ? P extends ""
    ? never
    : P
  : {
      [K in keyof T]: NestedKeys<T[K], P extends "" ? `${K & string}` : `${P}.${K & string}`>;
    }[keyof T];

export type MessageKey = NestedKeys<(typeof messages)["zh"]>;

function getNested(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === "string" ? cur : undefined;
}

export function translate(
  locale: Locale,
  key: MessageKey,
  params?: Record<string, string | number>,
): string {
  let str = getNested(messages[locale] as Record<string, unknown>, key) ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replaceAll(`{${k}}`, String(v));
    }
  }
  return str;
}

export function formatTimeAgo(locale: Locale, timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (locale === "zh") {
    if (minutes < 60) return `${minutes} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    if (days < 30) return `${days} 天前`;
    return new Date(timestamp).toLocaleDateString("zh-CN");
  }

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function kdaRatioText(
  locale: Locale,
  kills: number,
  deaths: number,
  assists: number,
): string {
  if (deaths === 0) return messages[locale].kdaPerfect;
  return ((kills + assists) / deaths).toFixed(2);
}
