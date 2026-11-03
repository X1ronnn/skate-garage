import { formatPrice } from "@/lib/utils";

export function RevenueChart({ data }: { data: { day: string; revenue: number; orders: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const W = 720, H = 220, pad = 28, bw = (W - pad) / data.length;
  const ticks = [0, 0.5, 1].map((t) => Math.round(max * t));
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H + 24}`} className="h-auto w-full" role="img" aria-label="Daily revenue for the last 30 days">
        {ticks.map((t) => {
          const y = H - (t / max) * (H - 10);
          return (
            <g key={t}>
              <line x1={pad} x2={W} y1={y} y2={y} stroke="#e4e4e7" strokeDasharray="3 3" />
              <text x={0} y={y + 4} fontSize="10" fill="#71717a">{t >= 1000 ? `${Math.round(t / 1000)}k` : t}</text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const h = (d.revenue / max) * (H - 10);
          const x = pad + i * bw + bw * 0.15;
          const label = new Date(d.day + "T00:00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric" });
          return (
            <g key={d.day}>
              <rect x={x} y={H - h} width={bw * 0.7} height={Math.max(h, d.revenue ? 2 : 0)} rx="3" fill="#18181b">
                <title>{`${label}: ${formatPrice(d.revenue)} · ${d.orders} orders`}</title>
              </rect>
              {i % 5 === 0 && <text x={x + bw * 0.35} y={H + 16} fontSize="10" textAnchor="middle" fill="#71717a">{label}</text>}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
