import { cn } from "@/lib/utils";

export function StatCard({ label, value, delta, hint }: { label: string; value: string; delta?: number | null; hint?: string }) {
  return (
    <div className="rounded-lg border border-border p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {delta != null && Number.isFinite(delta) ? (
        <p className={cn("mt-1 text-xs font-medium", delta >= 0 ? "text-emerald-600" : "text-red-600")}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(0)}% vs previous 30 days
        </p>
      ) : hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
