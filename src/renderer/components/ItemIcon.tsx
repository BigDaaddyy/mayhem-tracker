import { useState } from "react";
import { ITEM_ICON_URL } from "../lib/constants";
import { useGameDataVersion } from "../hooks/useChampions";

interface ItemIconProps {
  itemId: number;
  size?: number;
}

export default function ItemIcon({ itemId, size = 24 }: ItemIconProps) {
  const version = useGameDataVersion();
  const [failed, setFailed] = useState(false);

  if (!itemId || itemId === 0 || failed || !version) {
    return (
      <div
        className="rounded bg-white/5 border border-white/10"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <img
      key={`${version}-${itemId}`}
      src={ITEM_ICON_URL(itemId, version)}
      alt=""
      width={size}
      height={size}
      className="rounded"
      onError={() => setFailed(true)}
    />
  );
}
