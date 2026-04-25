import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save, RotateCcw, Link2, CheckCircle2, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_MODEL_URL, getModelUrl, setModelUrl } from "@/config/model";
import { toast } from "sonner";

const Settings = () => {
  const [url, setUrl] = useState(getModelUrl());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!/^https?:\/\/.+/i.test(url.trim())) {
      toast.error("Please enter a valid URL");
      return;
    }
    setModelUrl(url);
    setSaved(true);
    toast.success("Model URL saved. Reload the detector to apply.");
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setModelUrl("");
    setUrl(DEFAULT_MODEL_URL);
    toast.info("Reset to default model URL");
  };

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-50 glass">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-glow">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">PosturAI</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      </header>

      <section className="container max-w-3xl py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Link2 className="h-3.5 w-3.5" />
            Model Configuration
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold sm:text-5xl">
            Plug in your <span className="gradient-text">own model</span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            Paste the shareable URL from your Teachable Machine project. Format:
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs">
              https://teachablemachine.withgoogle.com/models/XXXXXXXXX/
            </code>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8"
        >
          <label className="mb-2 block text-sm font-semibold">
            Teachable Machine Model URL
          </label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://teachablemachine.withgoogle.com/models/.../"
            className="h-12 font-mono text-sm"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Stored locally in your browser — never sent to a server.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={handleSave} size="lg" className="gap-2">
              {saved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Model URL
                </>
              )}
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg" className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset to Default
            </Button>
          </div>

          <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-semibold text-primary">How to get a model URL</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Open your project at teachablemachine.withgoogle.com</li>
              <li>Click <span className="font-medium text-foreground">Export Model</span></li>
              <li>Choose <span className="font-medium text-foreground">Upload (shareable link)</span></li>
              <li>Copy the link and paste it above</li>
            </ol>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 rounded-2xl border border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground"
        >
          <span className="font-semibold text-foreground">Active URL:</span>{" "}
          <code className="break-all">{getModelUrl()}</code>
        </motion.div>
      </section>
    </div>
  );
};

export default Settings;
