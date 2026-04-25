import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Trophy, Zap, Quote, Target } from "lucide-react";
import type { HistoryEntry } from "@/components/StatsDashboard";

interface Props {
  history: HistoryEntry[];
}

const TIPS = [
  "Imagine a string pulling the crown of your head toward the ceiling.",
  "Roll your shoulders back and down — let your collarbones widen.",
  "Stack ears over shoulders, shoulders over hips.",
  "Engage your core lightly — like bracing for a gentle poke.",
  "Take a deep breath; let your ribcage lift, not your chin.",
  "Every 30 minutes, stand up and do a 10-second reset.",
  "Screen at eye level beats a sore neck every time.",
  "Soft knees, long spine, relaxed jaw.",
];

export const PostureInsights = ({ history }: Props) => {
  const [tipIdx, setTipIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTipIdx((i) => (i + 1) % TIPS.length), 5000);
    return () => clearInterval(id);
  }, []);

  const stats = useMemo(() => {
    const valid = history.filter((h) => h.verdict !== "unknown");
    const total = valid.length;
    const good = valid.filter((h) => h.verdict === "good").length;
    const goodPct = total ? Math.round((good / total) * 100) : 0;

    // Current streak of consecutive "good" from the end
    let streak = 0;
    for (let i = valid.length - 1; i >= 0; i--) {
      if (valid[i].verdict === "good") streak++;
      else break;
    }

    // Best streak overall
    let best = 0;
    let run = 0;
    for (const h of valid) {
      if (h.verdict === "good") {
        run++;
        if (run > best) best = run;
      } else run = 0;
    }

    // Approx good seconds (samples taken ~2/sec)
    const goodSeconds = Math.round(good / 2);

    // Score 0-100 (blend ratio + streak momentum)
    const momentum = Math.min(streak * 5, 30);
    const score = Math.min(100, Math.round(goodPct * 0.7 + momentum));

    return { total, goodPct, streak, best, goodSeconds, score };
  }, [history]);

  // Achievements
  const achievements = [
    { id: "first", label: "First Sample", unlocked: stats.total >= 1, icon: "🌱" },
    { id: "streak5", label: "5 in a row", unlocked: stats.best >= 5, icon: "🔥" },
    { id: "streak15", label: "15 streak", unlocked: stats.best >= 15, icon: "⚡" },
    { id: "minute", label: "1 min good", unlocked: stats.goodSeconds >= 60, icon: "⏱️" },
    { id: "ace", label: "80% accuracy", unlocked: stats.goodPct >= 80 && stats.total >= 20, icon: "🏆" },
    { id: "zen", label: "100 samples", unlocked: stats.total >= 100, icon: "🧘" },
  ];

  // Score ring math
  const R = 52;
  const C = 2 * Math.PI * R;
  const dash = (stats.score / 100) * C;

  return (
    <div className="overflow-hidden rounded-3xl bg-card shadow-card">
      {/* Top: Score ring + streak */}
      <div className="relative grid gap-6 border-b border-border/50 p-6 sm:p-8 lg:grid-cols-[auto_1fr]">
        {/* Decorative blob */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl" />

        <div className="relative flex items-center gap-5">
          <div className="relative h-32 w-32 shrink-0">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <circle
                cx="60"
                cy="60"
                r={R}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="10"
              />
              <motion.circle
                cx="60"
                cy="60"
                r={R}
                fill="none"
                stroke="url(#scoreGrad)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={C}
                initial={{ strokeDashoffset: C }}
                animate={{ strokeDashoffset: C - dash }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--secondary))" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-4xl font-bold tabular-nums">
                {stats.score}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Wellness
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-display text-2xl font-bold">Posture Journey</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {stats.total === 0
                ? "Start the detector to begin your journey."
                : `${stats.total} samples · ${stats.goodPct}% on point`}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge icon={<Flame className="h-3.5 w-3.5" />} label={`${stats.streak} streak`} tone="danger" />
              <Badge icon={<Trophy className="h-3.5 w-3.5" />} label={`Best ${stats.best}`} tone="primary" />
              <Badge icon={<Zap className="h-3.5 w-3.5" />} label={`${stats.goodSeconds}s good`} tone="success" />
            </div>
          </div>
        </div>

        {/* Rotating coach tip */}
        <div className="relative flex items-start gap-3 rounded-2xl border border-border/50 bg-gradient-to-br from-background to-muted/30 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white">
            <Quote className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Coach whispers
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={tipIdx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4 }}
                className="mt-1 text-sm font-medium leading-snug"
              >
                {TIPS[tipIdx]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Timeline heatbar */}
      <div className="border-b border-border/50 p-6 sm:p-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Posture Timeline
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {history.length === 0 ? "No data yet" : "Newest →"}
          </span>
        </div>

        <div className="flex h-16 items-end gap-[2px] rounded-2xl bg-muted/30 p-2">
          {history.length === 0 ? (
            <div className="flex w-full items-center justify-center text-xs text-muted-foreground">
              Your timeline will bloom here as you sit
            </div>
          ) : (
            history.slice(-60).map((h, i) => {
              const height = Math.max(8, h.confidence * 100);
              const color =
                h.verdict === "good"
                  ? "hsl(var(--success))"
                  : h.verdict === "bad"
                  ? "hsl(var(--danger))"
                  : "hsl(var(--muted-foreground))";
              return (
                <motion.div
                  key={`${h.ts}-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: `${height}%`, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 rounded-sm"
                  style={{ background: color, minWidth: 4 }}
                  title={`${h.verdict} · ${Math.round(h.confidence * 100)}%`}
                />
              );
            })
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
          <LegendDot color="hsl(var(--success))" label="Good" />
          <LegendDot color="hsl(var(--danger))" label="Slouch" />
          <LegendDot color="hsl(var(--muted-foreground))" label="Unclear" />
          <span className="ml-auto">Bar height = model confidence</span>
        </div>
      </div>

      {/* Achievements */}
      <div className="p-6 sm:p-8">
        <div className="mb-4 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Achievements
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {achievements.map((a) => (
            <motion.div
              key={a.id}
              whileHover={{ y: -2 }}
              className={`flex flex-col items-center gap-1 rounded-2xl border p-3 text-center transition-all ${
                a.unlocked
                  ? "border-primary/40 bg-gradient-to-br from-primary/10 to-secondary/10 shadow-glow"
                  : "border-border/50 bg-muted/20 opacity-50"
              }`}
            >
              <div className={`text-2xl ${a.unlocked ? "" : "grayscale"}`}>
                {a.icon}
              </div>
              <div className="text-[10px] font-semibold leading-tight">
                {a.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Badge = ({
  icon,
  label,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "primary" | "success" | "danger";
}) => {
  const map = {
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success/10 text-success border-success/20",
    danger: "bg-danger/10 text-danger border-danger/20",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${map[tone]}`}
    >
      {icon}
      {label}
    </span>
  );
};

const LegendDot = ({ color, label }: { color: string; label: string }) => (
  <span className="inline-flex items-center gap-1.5">
    <span
      className="h-2 w-2 rounded-full"
      style={{ background: color }}
    />
    {label}
  </span>
);
