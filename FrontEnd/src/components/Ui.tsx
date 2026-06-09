import type { NivelAlerta, StatusVegetacao } from "../types";

export function AlertaBadge({ nivel }: { nivel: NivelAlerta }) {
  return (
    <span
      className={`badge-${nivel} inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium`}
    >
      {nivel}
    </span>
  );
}

export function StatusBadge({ status }: { status: StatusVegetacao }) {
  const label = status === "EM_ESTRESSE" ? "EM ESTRESSE" : status;
  return (
    <span
      className={`badge-${status} inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium`}
    >
      {label}
    </span>
  );
}

export function RiskBar({
  value,
  label = "Risco hídrico",
}: {
  value: number;
  label?: string;
}) {
  const pct = Math.round(value * 100);
  const color =
    pct < 30
      ? "bg-accent"
      : pct < 55
        ? "bg-yellow-500"
        : pct < 75
          ? "bg-orange-500"
          : "bg-red-500";
  const tc =
    pct < 30
      ? "text-accent"
      : pct < 55
        ? "text-yellow-700"
        : pct < 75
          ? "text-orange-700"
          : "text-red-700";
  return (
    <div>
      {label && (
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-muted">{label}</span>
          <span className={`text-xs font-mono font-semibold ${tc}`}>
            {pct}%
          </span>
        </div>
      )}
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function NdviGauge({ value }: { value: number }) {
  const c =
    value >= 0.6
      ? "text-accent"
      : value >= 0.3
        ? "text-yellow-700"
        : "text-red-700";
  const bg =
    value >= 0.6 ? "bg-accent-bg" : value >= 0.3 ? "bg-yellow-50" : "bg-red-50";
  return (
    <div className={`text-center rounded-lg px-4 py-3 ${bg} w-full`}>
      <div className={`font-mono text-2xl font-semibold ${c}`}>
        {value.toFixed(2)}
      </div>
      <div className="text-xs text-muted mt-0.5">NDVI</div>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20 flex-col gap-3">
      <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
      <span className="text-xs text-muted">Carregando dados...</span>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr className="border-b border-border">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <td key={i} className="py-3 px-4">
          <div
            className="h-3 bg-border rounded animate-pulse"
            style={{ width: `${40 + ((i * 13) % 40)}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-surface border border-border rounded-xl p-4 animate-pulse ${className}`}
    >
      <div className="h-7 bg-border rounded w-16 mb-1" />
      <div className="h-3 bg-border rounded w-24" />
    </div>
  );
}

export function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-base font-semibold text-text">{title}</h2>
      {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
    </div>
  );
}

// Mini line chart — pure SVG
export function LineChart({
  values,
  color = "#2E7D4F",
  height = 48,
  labels,
}: {
  values: number[];
  color?: string;
  height?: number;
  labels?: string[];
}) {
  if (values.length < 2) return null;
  const max = Math.max(...values),
    min = Math.min(...values),
    range = max - min || 1;
  const w = 280;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = height - ((v - min) / range) * (height - 6) - 3;
    return { x, y, v };
  });
  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${w} ${height}`}
        className="w-full"
        preserveAspectRatio="none"
      >
        {/* Grid */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1="0"
            y1={height * (1 - f)}
            x2={w}
            y2={height * (1 - f)}
            stroke="#E2E2DD"
            strokeWidth="0.5"
            strokeDasharray="3,3"
          />
        ))}
        {/* Area fill */}
        <polygon
          points={`0,${height} ${polyline} ${w},${height}`}
          fill={color}
          opacity="0.08"
        />
        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
        />
        {/* Dots */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={color} />
        ))}
      </svg>
      {labels && (
        <div className="flex justify-between mt-1">
          {labels
            .filter(
              (_, i) =>
                i === 0 ||
                i === Math.floor(labels.length / 2) ||
                i === labels.length - 1,
            )
            .map((l, i) => (
              <span key={i} className="text-[10px] text-dim font-mono">
                {l}
              </span>
            ))}
        </div>
      )}
    </div>
  );
}

// Notification bell badge
export function NotifBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[9px] rounded-full flex items-center justify-center font-mono leading-none">
      {count > 9 ? "9+" : count}
    </span>
  );
}
