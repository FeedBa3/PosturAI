import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Crosshair, Film, Target, Activity, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Prediction, PostureVerdict, classifyVerdict } from "@/components/PostureDetector";
import { cn } from "@/lib/utils";

export type ReplayFrame = {
  ts: number;
  dataUrl: string;
  verdict: PostureVerdict;
  confidence: number;
};

interface Props {
  predictions: Prediction[];
  frames: ReplayFrame[];
  onClearFrames: () => void;
}

// Cosine similarity between two probability vectors
function cosine(a: Record<string, number>, b: Record<string, number>) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0,
    na = 0,
    nb = 0;
  keys.forEach((k) => {
    const av = a[k] || 0;
    const bv = b[k] || 0;
    dot += av * bv;
    na += av * av;
    nb += bv * bv;
  });
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export const DriftReplay = ({ predictions, frames, onClearFrames }: Props) => {
  const [baseline, setBaseline] = useState<Record<string, number> | null>(null);
  const [calibrating, setCalibrating] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [selectedFrame, setSelectedFrame] = useState<ReplayFrame | null>(null);

  const currentVec = useMemo(() => {
    const v: Record<string, number> = {};
    predictions.forEach((p) => (v[p.className] = p.probability));
    return v;
  }, [predictions]);

  // Calibration: collect ~3s of predictions and average them
  useEffect(() => {
    if (!calibrating) return;
    const samples: Record<string, number>[] = [];
    let elapsed = 3;
    setCountdown(3);

    const tick = setInterval(() => {
      elapsed -= 1;
      setCountdown(elapsed);
      if (elapsed <= 0) clearInterval(tick);
    }, 1000);

    const sampler = setInterval(() => {
      if (predictions.length) {
        const v: Record<string, number> = {};
        predictions.forEach((p) => (v[p.className] = p.probability));
        samples.push(v);
      }
    }, 150);

    const finish = setTimeout(() => {
      clearInterval(sampler);
      clearInterval(tick);
      if (samples.length) {
        const avg: Record<string, number> = {};
        samples.forEach((s) =>
          Object.entries(s).forEach(([k, val]) => {
            avg[k] = (avg[k] || 0) + val;
          })
        );
        Object.keys(avg).forEach((k) => (avg[k] /= samples.length));
        setBaseline(avg);
      }
      setCalibrating(false);
      setCountdown(0);
    }, 3000);

    return () => {
      clearInterval(sampler);
      clearInterval(tick);
      clearTimeout(finish);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calibrating]);

  const driftPct = useMemo(() => {
    if (!baseline || predictions.length === 0) return null;
    const sim = cosine(baseline, currentVec);
    return Math.round((1 - Math.max(0, Math.min(1, sim))) * 100);
  }, [baseline, currentVec, predictions.length]);

  const driftColor =
    driftPct === null
      ? "text-muted-foreground"
      : driftPct < 15
      ? "text-success"
      : driftPct < 35
      ? "text-warning"
      : "text-danger";

  const driftRingColor =
    driftPct === null
      ? "hsl(var(--muted))"
      : driftPct < 15
      ? "hsl(var(--success))"
      : driftPct < 35
      ? "hsl(var(--warning))"
      : "hsl(var(--danger))";

  const ringPct = driftPct === null ? 0 : Math.min(100, driftPct);
  const circumference = 2 * Math.PI * 52;
  const dash = (ringPct / 100) * circumference;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
          Model Intelligence
        </span>
        <h2 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
          Drift & <span className="gradient-text">Replay</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Calibrate a baseline pose, then watch how far you drift in real time. Scrub
          captured frames to audit what the model saw.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Drift Detector */}
        <div className="rounded-3xl bg-card p-6 shadow-card lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crosshair className="h-5 w-5 text-primary" />
              <h3 className="font-display text-xl font-bold">Drift Detector</h3>
            </div>
            {baseline && (
              <button
                onClick={() => setBaseline(null)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            )}
          </div>

          <div className="flex flex-col items-center">
            <div className="relative h-[140px] w-[140px]">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="10"
                  opacity="0.3"
                />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke={driftRingColor}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={false}
                  animate={{ strokeDashoffset: circumference - dash }}
                  transition={{ type: "spring", stiffness: 80, damping: 20 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {calibrating ? (
                  <>
                    <span className="font-display text-4xl font-bold text-primary">
                      {countdown}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Hold pose
                    </span>
                  </>
                ) : driftPct === null ? (
                  <>
                    <Target className="h-8 w-8 text-muted-foreground" />
                    <span className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                      No baseline
                    </span>
                  </>
                ) : (
                  <>
                    <span className={cn("font-display text-4xl font-bold", driftColor)}>
                      {driftPct}%
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Drift
                    </span>
                  </>
                )}
              </div>
            </div>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {!baseline
                ? "Sit in your ideal posture and capture a baseline. Drift is measured by cosine distance between live and baseline class probabilities."
                : driftPct !== null && driftPct < 15
                ? "Aligned with baseline — keep it up."
                : driftPct !== null && driftPct < 35
                ? "Slight deviation. Re-center yourself."
                : "Significant drift detected."}
            </p>

            <Button
              onClick={() => setCalibrating(true)}
              disabled={calibrating || predictions.length === 0}
              size="lg"
              className="mt-5 w-full gap-2"
            >
              <Activity className="h-4 w-4" />
              {baseline ? "Recalibrate" : "Calibrate baseline (3s)"}
            </Button>
          </div>
        </div>

        {/* Session Replay Strip */}
        <div className="rounded-3xl bg-card p-6 shadow-card lg:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="h-5 w-5 text-primary" />
              <h3 className="font-display text-xl font-bold">Session Replay</h3>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {frames.length}
              </span>
            </div>
            {frames.length > 0 && (
              <button
                onClick={() => {
                  onClearFrames();
                  setSelectedFrame(null);
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          {frames.length === 0 ? (
            <div className="flex h-[280px] items-center justify-center rounded-2xl border border-dashed border-border text-center text-sm text-muted-foreground">
              <div>
                <Film className="mx-auto mb-2 h-8 w-8 opacity-40" />
                Start the webcam — frames will be captured every 4s.
              </div>
            </div>
          ) : (
            <>
              {/* Selected preview */}
              <div className="mb-4 overflow-hidden rounded-2xl bg-muted">
                {selectedFrame ? (
                  <div className="relative">
                    <img
                      src={selectedFrame.dataUrl}
                      alt="Replay frame"
                      className="h-[220px] w-full object-cover"
                    />
                    <div
                      className={cn(
                        "absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white",
                        selectedFrame.verdict === "good" && "bg-success/90",
                        selectedFrame.verdict === "bad" && "bg-danger/90",
                        selectedFrame.verdict === "unknown" && "bg-muted-foreground/90"
                      )}
                    >
                      {selectedFrame.verdict}
                    </div>
                    <div className="absolute right-3 top-3 rounded-full bg-background/80 px-3 py-1 text-xs font-medium backdrop-blur">
                      {Math.round(selectedFrame.confidence * 100)}% conf
                    </div>
                    <div className="absolute bottom-3 left-3 rounded-full bg-background/80 px-3 py-1 text-xs backdrop-blur">
                      {new Date(selectedFrame.ts).toLocaleTimeString()}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                    Click a frame below to inspect what the model saw.
                  </div>
                )}
              </div>

              {/* Filmstrip */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[...frames].reverse().map((f) => (
                  <button
                    key={f.ts}
                    onClick={() => setSelectedFrame(f)}
                    className={cn(
                      "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all hover:scale-105",
                      selectedFrame?.ts === f.ts
                        ? "border-primary shadow-glow"
                        : "border-transparent"
                    )}
                  >
                    <img
                      src={f.dataUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <div
                      className={cn(
                        "absolute inset-0 mix-blend-multiply",
                        f.verdict === "good" && "bg-success/40",
                        f.verdict === "bad" && "bg-danger/40",
                        f.verdict === "unknown" && "bg-muted/30"
                      )}
                    />
                    <span className="absolute bottom-0 left-0 right-0 bg-background/70 py-0.5 text-center text-[9px] font-medium backdrop-blur">
                      {new Date(f.ts).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
