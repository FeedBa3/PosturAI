import { motion } from "framer-motion";
import { Activity, TrendingUp, Award, History } from "lucide-react";

export type HistoryEntry = {
  ts: number;
  verdict: "good" | "bad" | "unknown";
  confidence: number; // 0..1
};

interface Props {
  history: HistoryEntry[];
}

export const StatsDashboard = ({ history }: Props) => {
  const valid = history.filter((h) => h.verdict !== "unknown");
  const total = valid.length;
  const goodCount = valid.filter((h) => h.verdict === "good").length;
  const goodPct = total ? Math.round((goodCount / total) * 100) : 0;
  const avgConf = total
    ? Math.round((valid.reduce((s, h) => s + h.confidence, 0) / total) * 100)
    : 0;

  // Posture score = blend of good ratio and avg confidence
  const score = total ? Math.round(goodPct * 0.7 + avgConf * 0.3) : 0;

  // Build sparkline from last 30 entries
  const recent = history.slice(-30);
  const w = 300;
  const h = 80;
  const points = recent.map((entry, i) => {
    const x = recent.length > 1 ? (i / (recent.length - 1)) * w : w / 2;
    const y = h - entry.confidence * h;
    return `${x},${y}`;
  });
  const linePath = points.length ? `M ${points.join(" L ")}` : "";
  const areaPath = points.length
    ? `M 0,${h} L ${points.join(" L ")} L ${w},${h} Z`
    : "";

  const stats = [
    {
      label: "Posture Score",
      value: `${score}`,
      suffix: "/100",
      icon: Award,
      color: "from-primary to-primary-glow",
    },
    {
      label: "Good Posture",
      value: `${goodPct}`,
      suffix: "%",
      icon: TrendingUp,
      color: "from-success to-primary",
    },
    {
      label: "Avg Confidence",
      value: `${avgConf}`,
      suffix: "%",
      icon: Activity,
      color: "from-secondary to-accent",
    },
    {
      label: "Samples",
      value: `${total}`,
      suffix: "",
      icon: History,
      color: "from-accent to-secondary",
    },
  ];

  return (
    <div className="rounded-3xl bg-card p-6 shadow-card sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-display text-2xl font-bold">Live Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            Tracking your posture over the last {recent.length || 0} samples
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-background to-muted/30 p-4"
            >
              <div
                className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${s.color} text-white`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="font-display text-2xl font-bold tabular-nums">
                {s.value}
                <span className="text-sm text-muted-foreground">{s.suffix}</span>
              </div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Sparkline */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold uppercase tracking-wider">
            Confidence over time
          </span>
          <span>{recent.length} pts</span>
        </div>
        <div className="rounded-2xl bg-muted/30 p-4">
          <svg
            viewBox={`0 0 ${w} ${h}`}
            className="h-24 w-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </linearGradient>
            </defs>
            {linePath && (
              <>
                <path d={areaPath} fill="url(#confGrad)" />
                <path
                  d={linePath}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {recent.map((entry, i) => {
                  const x =
                    recent.length > 1 ? (i / (recent.length - 1)) * w : w / 2;
                  const y = h - entry.confidence * h;
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="2"
                      fill={
                        entry.verdict === "good"
                          ? "hsl(var(--success))"
                          : entry.verdict === "bad"
                          ? "hsl(var(--danger))"
                          : "hsl(var(--muted-foreground))"
                      }
                    />
                  );
                })}
              </>
            )}
            {!linePath && (
              <text
                x={w / 2}
                y={h / 2}
                textAnchor="middle"
                fill="hsl(var(--muted-foreground))"
                fontSize="11"
              >
                Start the detector to see your trend
              </text>
            )}
          </svg>

          {/* Verdict ribbon */}
          {recent.length > 0 && (
            <div className="mt-3 flex h-2 overflow-hidden rounded-full">
              {recent.map((e, i) => (
                <div
                  key={i}
                  className="h-full flex-1"
                  style={{
                    background:
                      e.verdict === "good"
                        ? "hsl(var(--success))"
                        : e.verdict === "bad"
                        ? "hsl(var(--danger))"
                        : "hsl(var(--muted))",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
