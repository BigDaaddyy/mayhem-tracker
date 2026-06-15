# Mayhem Tracker

[English](#english) · [简体中文](#简体中文)

---

## 简体中文

用于记录《英雄联盟》**符文大乱斗（ARAM Mayhem，queueId 2400）**对局历史的桌面应用。通过 League Client（LCU）自动抓取对局，并在本地展示统计与详情。

### 功能

- 通过 LCU 自动检测并记录 Mayhem 对局
- 对局历史与单场详情（装备、强化、KDA 等）
- 英雄、强化、队友统计与胜率
- 聚合全场玩家数据
- 本地 SQLite 数据库，数据保存在本机
- 启动时自动刷新游戏资源（英雄名、强化名、装备图标版本）
- 支持简体中文 / English 界面切换

### 下载

在 [Releases](https://github.com/BigDaaddyy/mayhem-tracker/releases) 页面下载 Windows 便携版 `.exe`（`Mayhem Tracker x.x.x.exe`），无需安装，双击即可运行。

### 开发

```bash
npm install
npm run rebuild   # 为 Electron 重新编译原生模块
npm run dev       # 开发模式
```

### 打包

```bash
npm run dist      # 生成 Windows portable 可执行文件，输出至 dist/
```

### 致谢与声明

**上游项目**

本项目基于 [Yhprum/mayhem-tracker](https://github.com/Yhprum/mayhem-tracker) 开发，感谢原作者的开源工作。

**第三方数据与服务**

| 来源 | 用途 |
| --- | --- |
| [Riot Data Dragon](https://developer.riotgames.com/docs/lol#data-dragon) | 英雄名称、装备图标 |
| [CommunityDragon](https://github.com/CommunityDragon/CDTB) | 强化（Augment）名称与图标资源 |
| [league-connect](https://github.com/mingweisamuel/league-connect) | 连接 League Client（LCU） |

**Riot Games 免责声明**

Mayhem Tracker 依据 Riot Games 的 [Legal Jibber Jabber](https://www.riotgames.com/en/legal) 政策制作，使用了 Riot Games 拥有的素材。**Riot Games 并未认可或赞助本项目。** Mayhem Tracker 不代表 Riot Games 或任何官方相关方的观点。League of Legends 及相关资产均为 Riot Games, Inc. 的商标或注册商标。

**CommunityDragon 说明**

游戏内图标等资源来自 CommunityDragon 社区提取与托管，与 Riot Games 无官方关联。

---

## English

Desktop app for tracking **ARAM Mayhem** (queueId 2400) match history in League of Legends. Connects to the League Client (LCU) to automatically record matches and display stats locally.

### Features

- Automatic Mayhem match detection via LCU
- Match history with per-game breakdowns (items, augments, KDA, etc.)
- Champion, augment, and teammate stats with win rates
- Aggregate statistics across all players in your games
- Local SQLite database
- Game data refresh on startup (champion/augment names, item icon patch)
- Simplified Chinese / English UI

### Download

Grab the Windows portable `.exe` from [Releases](https://github.com/BigDaaddyy/mayhem-tracker/releases) (`Mayhem Tracker x.x.x.exe`). No installer required.

### Development

```bash
npm install
npm run rebuild   # rebuild native modules for Electron
npm run dev       # start in dev mode
```

### Build

```bash
npm run dist      # build Windows portable executable into dist/
```

### Credits & Disclaimer

**Upstream**

This project is based on [Yhprum/mayhem-tracker](https://github.com/Yhprum/mayhem-tracker). Thanks to the original author for the open-source foundation.

**Third-party data & libraries**

| Source | Used for |
| --- | --- |
| [Riot Data Dragon](https://developer.riotgames.com/docs/lol#data-dragon) | Champion names, item icons |
| [CommunityDragon](https://github.com/CommunityDragon/CDTB) | Augment names and icon assets |
| [league-connect](https://github.com/mingweisamuel/league-connect) | League Client (LCU) integration |

**Riot Games disclaimer**

Mayhem Tracker was created under Riot Games' [Legal Jibber Jabber](https://www.riotgames.com/en/legal) policy using assets owned by Riot Games. **Riot Games does not endorse or sponsor this project.** Mayhem Tracker does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. League of Legends and all associated properties are trademarks or registered trademarks of Riot Games, Inc.

**CommunityDragon notice**

In-game icon assets are sourced from the CommunityDragon community extraction and CDN; they are not officially affiliated with Riot Games.
