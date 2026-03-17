import { Badge } from "@/components/ui/badge";
import { cn, titleCase } from "@/lib/utils";
import { type RiskBand } from "@/lib/types";

const bandClasses: Record<RiskBand, string> = {
  low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  high: "border-rose-200 bg-rose-50 text-rose-700"
};

export function RiskBadge({ band }: { band: RiskBand }) {
  return <Badge className={cn(bandClasses[band])}>{titleCase(band)}</Badge>;
}

