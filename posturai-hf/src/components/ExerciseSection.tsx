import { motion } from "framer-motion";
import { Clock, Repeat, Target, Sparkles } from "lucide-react";
import chinTucks from "@/assets/exercises/chin-tucks.jpg";
import wallAngels from "@/assets/exercises/wall-angels.jpg";
import catCow from "@/assets/exercises/cat-cow.jpg";
import doorwayStretch from "@/assets/exercises/doorway-stretch.jpg";
import plank from "@/assets/exercises/plank.jpg";
import gluteBridge from "@/assets/exercises/glute-bridge.jpg";
import { PostureVerdict } from "./PostureDetector";

export type Exercise = {
  name: string;
  goal: "fix" | "maintain";
  duration: string;
  reps: string;
  benefit: string;
  steps: string[];
  image: string;
};

export const EXERCISES: Exercise[] = [
  {
    name: "Chin Tucks",
    goal: "fix",
    duration: "30 sec",
    reps: "10 reps",
    benefit: "Reverses forward-head posture from screen time",
    image: chinTucks,
    steps: [
      "Sit or stand tall with shoulders relaxed",
      "Gently pull your chin straight back, making a 'double chin'",
      "Hold for 3 seconds, then release",
    ],
  },
  {
    name: "Wall Angels",
    goal: "fix",
    duration: "1 min",
    reps: "10 reps",
    benefit: "Opens chest and strengthens upper-back muscles",
    image: wallAngels,
    steps: [
      "Stand with back flat against a wall, feet 6 inches out",
      "Press arms against wall in a 'W' shape",
      "Slowly slide arms up to a 'Y' and back down",
    ],
  },
  {
    name: "Cat–Cow Stretch",
    goal: "fix",
    duration: "1 min",
    reps: "8 cycles",
    benefit: "Mobilizes the spine and relieves lower-back tension",
    image: catCow,
    steps: [
      "Start on hands and knees, wrists under shoulders",
      "Inhale: drop belly, lift chest and tailbone (Cow)",
      "Exhale: round spine, tuck chin and tailbone (Cat)",
    ],
  },
  {
    name: "Doorway Chest Stretch",
    goal: "fix",
    duration: "30 sec / side",
    reps: "3 sets",
    benefit: "Releases tight chest muscles that pull shoulders forward",
    image: doorwayStretch,
    steps: [
      "Place forearm on a doorframe, elbow at 90°",
      "Step forward gently until you feel a stretch in your chest",
      "Hold, breathe deeply, then switch sides",
    ],
  },
  {
    name: "Plank Hold",
    goal: "maintain",
    duration: "30–60 sec",
    reps: "3 sets",
    benefit: "Builds core stability that supports an upright spine",
    image: plank,
    steps: [
      "Forearms on floor, body in a straight line from head to heels",
      "Engage core, glutes, and quads",
      "Keep neck neutral — don't drop your hips",
    ],
  },
  {
    name: "Glute Bridge",
    goal: "maintain",
    duration: "45 sec",
    reps: "12 reps",
    benefit: "Strengthens glutes and counteracts a sedentary posture",
    image: gluteBridge,
    steps: [
      "Lie on your back, knees bent, feet flat",
      "Squeeze glutes and lift hips into a straight line",
      "Pause at the top, lower with control",
    ],
  },
];

interface Props {
  verdict: PostureVerdict;
}

export const ExerciseSection = ({ verdict }: Props) => {
  const recommended =
    verdict === "bad" ? "fix" : verdict === "good" ? "maintain" : null;

  const banner =
    verdict === "bad"
      ? {
          title: "Your posture needs attention",
          subtitle:
            "We've highlighted corrective exercises to realign your spine and release tension.",
          tone: "bg-danger/10 text-danger border-danger/30",
        }
      : verdict === "good"
      ? {
          title: "Great posture — keep it that way",
          subtitle:
            "These maintenance moves build the strength to keep you upright all day.",
          tone: "bg-success/10 text-success border-success/30",
        }
      : {
          title: "Run the detector for personalized picks",
          subtitle:
            "Once we know your posture, we'll recommend the right exercises for you.",
          tone: "bg-muted text-muted-foreground border-border",
        };

  // Sort: recommended type first
  const sorted = [...EXERCISES].sort((a, b) => {
    if (!recommended) return 0;
    if (a.goal === recommended && b.goal !== recommended) return -1;
    if (b.goal === recommended && a.goal !== recommended) return 1;
    return 0;
  });

  return (
    <section id="exercises" className="space-y-8">
      <div className="text-center">
        <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
          Move Better
        </span>
        <h2 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
          Smart <span className="gradient-text">exercise picks</span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Recommendations adapt based on your detected posture — fix what hurts now,
          and build the habits that keep you upright.
        </p>
      </div>

      <motion.div
        key={verdict}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mx-auto flex max-w-3xl items-start gap-3 rounded-2xl border p-4 ${banner.tone}`}
      >
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">{banner.title}</p>
          <p className="text-sm opacity-80">{banner.subtitle}</p>
        </div>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((ex, i) => {
          const isRecommended = recommended && ex.goal === recommended;
          return (
            <motion.div
              key={ex.name}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className={`group relative flex flex-col overflow-hidden rounded-3xl border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-glow ${
                isRecommended
                  ? "border-primary/50 ring-2 ring-primary/30"
                  : "border-border/50"
              }`}
            >
              {/* Image */}
              <div className="relative aspect-[3/2] overflow-hidden bg-muted">
                <img
                  src={ex.image}
                  alt={`${ex.name} exercise illustration`}
                  width={768}
                  height={512}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {isRecommended && (
                  <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-glow">
                    <Sparkles className="h-3 w-3" />
                    Recommended
                  </div>
                )}
                <span
                  className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur ${
                    ex.goal === "fix"
                      ? "bg-danger/90 text-white"
                      : "bg-success/90 text-white"
                  }`}
                >
                  {ex.goal === "fix" ? "Fix" : "Maintain"}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-4 p-6">
                <div>
                  <h3 className="font-display text-xl font-bold">{ex.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{ex.benefit}</p>
                </div>

                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {ex.duration}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Repeat className="h-3.5 w-3.5" />
                    {ex.reps}
                  </span>
                </div>

                <ol className="space-y-2 border-t border-border/50 pt-4 text-sm">
                  {ex.steps.map((s, idx) => (
                    <li key={idx} className="flex gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                        {idx + 1}
                      </span>
                      <span className="text-muted-foreground">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">
        <Target className="h-5 w-5 shrink-0 text-primary" />
        <p className="text-muted-foreground">
          <span className="font-semibold text-foreground">Pro tip:</span> Pair these
          with 5-minute posture checks every hour using the live detector above.
        </p>
      </div>
    </section>
  );
};
