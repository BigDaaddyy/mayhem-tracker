import { useAugmentData } from "../hooks/useChampions";
import { useI18n } from "../hooks/useI18n";
import { AUGMENT_ICON_BASE } from "../lib/constants";

interface AugmentIconProps {
  augmentId: number;
  size?: number;
  showName?: boolean;
}

const rarityBorder: Record<string, string> = {
  kSilver: "ring-1 ring-gray-400/60",
  kGold: "ring-1 ring-yellow-500/70",
  kPrismatic: "ring-1 ring-fuchsia-400/80",
};

const rarityTextColor: Record<string, string> = {
  kSilver: "text-gray-300",
  kGold: "text-yellow-400",
  kPrismatic: "text-fuchsia-400",
};

export function getAugmentRarityLabel(rarity: string, locale: "zh" | "en"): string {
  const labels =
    locale === "zh"
      ? { kSilver: "白银", kGold: "黄金", kPrismatic: "棱彩" }
      : { kSilver: "Silver", kGold: "Gold", kPrismatic: "Prismatic" };
  return labels[rarity as keyof typeof labels] || "";
}

export default function AugmentIcon({ augmentId, size = 28, showName = false }: AugmentIconProps) {
  const { t } = useI18n();
  const augmentData = useAugmentData();
  const aug = augmentData[augmentId];

  if (!aug) {
    return showName ? (
      <span className="text-xs text-lol-text">{t("augments.fallback", { id: augmentId })}</span>
    ) : null;
  }

  const iconUrl = aug.iconPath
    ? AUGMENT_ICON_BASE +
      aug.iconPath.replace("/lol-game-data/assets/", "").replace("small", "large").toLowerCase()
    : "";

  const borderClass = rarityBorder[aug.rarity] || "";
  const nameColor = rarityTextColor[aug.rarity] || "text-lol-text-bright";

  return (
    <div className="flex items-center gap-1.5" title={aug.name}>
      {iconUrl && (
        <img
          src={iconUrl}
          alt={aug.name}
          width={size}
          height={size}
          className={`rounded ${borderClass}`}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      {showName && <span className={`text-xs ${nameColor}`}>{aug.name}</span>}
    </div>
  );
}
