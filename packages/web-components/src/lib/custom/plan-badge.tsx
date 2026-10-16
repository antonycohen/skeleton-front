import {Sparkles} from "lucide-react";
import {useTranslation} from "@skeleton/core-translations";

type PlanBadgeProps = {
  label?: string;
}
export const PlanBadge = (props: PlanBadgeProps) => {
  const { t } = useTranslation();
  const planName = props.label ?? t('components.planBadge.default');
  return <div className="rounded-md bg-gradient-to-tr from-blue-500 via-violet-500 to-fuchsia-300 p-[2px]">
    <div className="flex items-center gap-1 rounded-[6px] bg-background px-2 py-0.5">
      <Sparkles className="size-3" />
      <span className="text-xs font-semibold">{planName}</span>
    </div>
  </div>
}
