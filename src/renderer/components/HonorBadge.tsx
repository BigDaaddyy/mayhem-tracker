import { useI18n } from "../hooks/useI18n";
import type { MatchHonor } from "../../shared/matchHonors";

interface HonorBadgeProps {
  honor: MatchHonor;
}

export default function HonorBadge({ honor }: HonorBadgeProps) {
  const { t } = useI18n();
  const isMvp = honor === "mvp";

  return (
    <span
      className={`shrink-0 text-[10px] font-bold px-1 py-0.5 rounded leading-none ${
        isMvp ? "bg-yellow-500/25 text-yellow-300" : "bg-sky-500/20 text-sky-300"
      }`}
      title={isMvp ? t("honor.mvpTitle") : t("honor.svpTitle")}
    >
      {isMvp ? t("honor.mvp") : t("honor.svp")}
    </span>
  );
}
