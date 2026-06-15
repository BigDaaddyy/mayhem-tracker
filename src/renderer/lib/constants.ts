export const CHAMPION_ICON_URL = (id: number): string =>
  `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${id}.png`;

export const AUGMENT_ICON_BASE = "https://raw.communitydragon.org/latest/game/";

export const ITEM_ICON_URL = (itemId: number, version: string): string =>
  `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${itemId}.png`;

export const QUEUE_ID_MAYHEM = 2400;
