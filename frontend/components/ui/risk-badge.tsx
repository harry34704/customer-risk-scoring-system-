import { Badge } from "@/components/ui/badge";
import { cn, titleCase } from "@/lib/utils";
import { type RiskBand } from "@/lib/types";

const bandClasses: Record<RiskBand, string> = {
  low: "border-[color:var(--success)] bg-[color:var(--success-soft)] text-[color:var(--success)]",
  medium: "border-[color:var(--warning)] bg-[color:var(--warning-soft)] text-[color:var(--warning)]",
  high: "border-[color:var(--danger)] bg-[color:var(--danger-soft)] text-[color:var(--danger)]"
};

export function RiskBadge({ band }: { band: RiskBand }) {
  return <Badge className={cn(bandClasses[band])}>{titleCase(band)}</Badge>;
}
