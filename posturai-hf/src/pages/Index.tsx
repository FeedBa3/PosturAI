import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, Sparkles, ChevronDown, Settings as SettingsIcon } from "lucide-react";
import {
  PostureDetector,
  Prediction,
  classifyVerdict,
  PostureVerdict,
} from "@/components/PostureDetector";
import { PostureResult } from "@/components/PostureResult";
import { ExerciseSection } from "@/components/ExerciseSection";
import { HistoryEntry } from "@/components/StatsDashboard";

const Index = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const lastSampleRef = useRef(0);


  // Sample predictions ~2x/sec into history (cap at 120 entries)
  useEffect(() => {
    if (predictions.length === 0) return;
    const now = Date.now();
    if (now - lastSampleRef.current < 500) return;
    lastSampleRef.current = now;

    const top = [...predictions].sort((a, b) => b.probability - a.probability)[0];
    const verdict = classifyVerdict(top);
    setHistory((prev) =>
      [...prev, { ts: now, verdict, confidence: top.probability }].slice(-120)
    );
  }, [predictions]);

  const top = [...predictions].sort((a, b) => b.probability - a.probability)[0];
  const currentVerdict: PostureVerdict = classifyVerdict(top);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-50 glass">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-glow">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold">PosturAI</span>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <button onClick={() => scrollTo("detector")} className="hidden hover:text-primary sm:inline">
              Detector
            </button>
            <button onClick={() => scrollTo("exercises")} className="hidden hover:text-primary sm:inline">
              Exercises
            </button>
            <Link
              to="/settings"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-primary hover:bg-primary/20"
            >
              <SettingsIcon className="h-3.5 w-3.5" /> Settings
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container pt-16 pb-20 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Posture Coach
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] sm:text-7xl">
            Sit <span className="gradient-text">stronger</span>,
            <br /> live <span className="gradient-text">longer</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Real-time posture detection powered by a Teachable Machine model.
            Get instant feedback, track your accuracy over time, and follow a
            personalized routine to fix what's hurting you.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => scrollTo("detector")}
              className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-transform hover:scale-105"
            >
              Try the detector →
            </button>
            <button
              onClick={() => scrollTo("exercises")}
              className="rounded-full border border-border bg-card/50 px-6 py-3 text-sm font-semibold backdrop-blur transition-colors hover:bg-card"
            >
              See exercises
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-16 flex justify-center"
        >
          <ChevronDown className="h-6 w-6 animate-bounce text-muted-foreground" />
        </motion.div>
      </section>

      {/* Detector */}
      <section id="detector" className="container pb-16">
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full bg-secondary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-secondary">
            Live Analysis
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
            Your <span className="gradient-text">posture mirror</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Sit in front of your camera or upload an image. The AI classifies your
            posture in real-time with confidence scoring.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="rounded-3xl bg-card p-4 shadow-card sm:p-6">
              <PostureDetector onPrediction={setPredictions} />
            </div>
          </div>
          <div className="lg:col-span-2">
            <PostureResult predictions={predictions} />
          </div>
        </div>
      </section>


      {/* Exercises */}
      <section className="container pb-24">
        <ExerciseSection verdict={currentVerdict} />
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container text-center text-sm text-muted-foreground">
          Built with ❤️ — configure your model URL in{" "}
          <Link to="/settings" className="text-primary underline-offset-4 hover:underline">
            Settings
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Index;
