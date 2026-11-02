import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({ value, count, className }: { value: number | null; count?: number | null; className?: string }) {
  const v = value ?? 0;
  return (
    <div className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", className)} aria-label={`Rated ${v} out of 5`}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={cn("h-3.5 w-3.5", i <= Math.round(v) ? "fill-amber-400 text-amber-400" : "text-zinc-300")} />
        ))}
      </div>
      {value != null && <span className="font-medium text-foreground">{v.toFixed(1)}</span>}
      {count != null && <span>({count})</span>}
    </div>
  );
}
