import { motion } from "framer-motion";
import { Prediction, classifyVerdict } from "./PostureDetector";
import { CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  predictions: Prediction[];
}

export const PostureResult = ({ predictions }: Props) => {
  const sorted = [...predictions].sort((a, b) => b.probability - a.probability);
  const top = sorted[0] || null;
  const verdict = classifyVerdict(top);
  const accuracy = top ? Math.round(top.probability * 100) : 0;

  const config = {
    good: {
      label: "Good Posture",
      icon: CheckCircle2,
      gradient: "var(--gradient-good)",
      ring: "hsl(var(--success))",
      msg: "Excellent! Keep your spine aligned and shoulders relaxed.",
    },
    bad: {
      label: "Poor Posture",
      icon: AlertTriangle,
      gradient: "var(--gradient-bad)",
      ring: "hsl(var(--danger))",
      msg: "Adjust now: lift your chest, pull shoulders back, align your head over your hips.",
    },
    unknown: {
      label: "Awaiting Analysis",
      icon: HelpCircle,
      gradient: "linear-gradient(135deg, hsl(var(--muted-foreground)), hsl(var(--muted-foreground)/0.7))",
      ring: "hsl(var(--muted-foreground))",
      msg: "Start the webcam or upload an image to begin posture analysis.",
    },
  }[verdict];

  const Icon = config.icon;
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (accuracy / 100) * circumference;

  return (
    <div className="rounded-3xl bg-card p-6 shadow-card sm:p-8">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <svg width="180" height="180" className="-rotate-90">
            <circle
              cx="90"
              cy="90"
              r="70"
              stroke="hsl(var(--muted))"
              strokeWidth="12"
              fill="none"
            />
            <motion.circle
              cx="90"
              cy="90"
              r="70"
              stroke={config.ring}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: top ? offset : circumference }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              key={accuracy}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-display text-5xl font-bold"
            >
              {accuracy}
              <span className="text-2xl text-muted-foreground">%</span>
            </motion.div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Confidence
            </span>
          </div>
        </div>

        <motion.div
          key={verdict}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex w-full flex-col items-center gap-3"
        >
          <div
            className="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white shadow-glow"
            style={{ background: config.gradient }}
          >
            <Icon className="h-4 w-4" />
            {config.label}
          </div>
          <p className="text-center text-sm text-muted-foreground">{config.msg}</p>
        </motion.div>

        {sorted.length > 0 && (
          <div className="w-full space-y-2 pt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Class probabilities
            </h4>
            {sorted.map((p) => {
              const v = classifyVerdict(p);
              const pct = Math.round(p.probability * 100);
              const displayName =
                v === "good" ? "Good" : v === "bad" ? "Bad" : "Average";
              return (
                <div key={p.className} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{displayName}</span>
                    <span className="tabular-nums text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        v === "good" && "bg-success",
                        v === "bad" && "bg-danger",
                        v === "unknown" && "bg-warning"
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
