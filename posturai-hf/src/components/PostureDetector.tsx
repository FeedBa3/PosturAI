import { useEffect, useRef, useState } from "react";
import * as tmImage from "@teachablemachine/image";
import { SelfieSegmentation, Results as SegResults } from "@mediapipe/selfie_segmentation";
import { getModelUrl, GOOD_LABELS, BAD_LABELS } from "@/config/model";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, Loader2, Upload, AlertCircle, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type Prediction = {
  className: string;
  probability: number;
};

export type PostureVerdict = "good" | "bad" | "unknown";

export function classifyVerdict(top: Prediction | null): PostureVerdict {
  if (!top) return "unknown";
  const name = top.className.toLowerCase();
  if (GOOD_LABELS.some((l) => name.includes(l))) return "good";
  if (BAD_LABELS.some((l) => name.includes(l))) return "bad";
  return "unknown";
}

interface Props {
  onPrediction: (preds: Prediction[]) => void;
  onFrame?: (dataUrl: string) => void;
}

export const PostureDetector = ({ onPrediction, onFrame }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const modelRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const segRef = useRef<SelfieSegmentation | null>(null);
  const blurEnabledRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [blurBg, setBlurBg] = useState(false);

  useEffect(() => {
    blurEnabledRef.current = blurBg;
  }, [blurBg]);

  const ensureSegmenter = async () => {
    if (segRef.current) return segRef.current;
    const seg = new SelfieSegmentation({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
    });
    seg.setOptions({ modelSelection: 1, selfieMode: true });
    await seg.initialize();
    segRef.current = seg;
    return seg;
  };

  const drawWithBlur = (results: SegResults) => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.save();
    ctx.clearRect(0, 0, w, h);
    ctx.filter = "blur(14px)";
    ctx.drawImage(results.image, 0, 0, w, h);
    ctx.filter = "none";
    ctx.globalCompositeOperation = "destination-out";
    ctx.drawImage(results.segmentationMask, 0, 0, w, h);
    ctx.globalCompositeOperation = "destination-over";
    ctx.drawImage(results.image, 0, 0, w, h);
    ctx.restore();
  };

  const ensureModel = async () => {
    if (modelRef.current) return modelRef.current;
    setLoading(true);
    setError(null);
    try {
      const url = getModelUrl();
      const base = url.endsWith("/") ? url : url + "/";
      const model = await tmImage.load(base + "model.json", base + "metadata.json");
      modelRef.current = model;
      return model;
    } catch (e: any) {
      setError(
        "Could not load the Teachable Machine model. Update the URL in Settings."
      );
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {}
      videoRef.current.srcObject = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setRunning(false);
  };

  const start = async () => {
    setError(null);
    setImgUrl(null);
    try {
      const model = await ensureModel();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        // Wait for metadata before calling play() to avoid
        // "play() interrupted by a new load request"
        await new Promise<void>((resolve) => {
          if (video.readyState >= 1) return resolve();
          const onLoaded = () => {
            video.removeEventListener("loadedmetadata", onLoaded);
            resolve();
          };
          video.addEventListener("loadedmetadata", onLoaded);
        });
        try {
          await video.play();
        } catch (err: any) {
          // AbortError happens if stop() was called mid-play; ignore it
          if (err?.name !== "AbortError") throw err;
          return;
        }
      }
      setRunning(true);

      ensureSegmenter().catch(() => {});

      let lastFrameAt = 0;
      const loop = async () => {
        const video = videoRef.current;
        if (!video || !modelRef.current) return;
        try {
          const preds: Prediction[] = await model.predict(video);
          onPrediction(preds);

          if (blurEnabledRef.current && segRef.current && video.videoWidth > 0) {
            const display = displayCanvasRef.current;
            if (display) {
              if (display.width !== video.videoWidth) {
                display.width = video.videoWidth;
                display.height = video.videoHeight;
              }
              segRef.current.onResults(drawWithBlur);
              await segRef.current.send({ image: video });
            }
          }

          // Snapshot a small thumbnail every 4s for the replay strip
          const now = Date.now();
          if (onFrame && now - lastFrameAt > 4000 && video.videoWidth > 0) {
            lastFrameAt = now;
            const thumb = canvasRef.current!;
            const tw = 160;
            const th = Math.round((video.videoHeight / video.videoWidth) * tw);
            thumb.width = tw;
            thumb.height = th;
            const tctx = thumb.getContext("2d")!;
            tctx.save();
            tctx.translate(tw, 0);
            tctx.scale(-1, 1);
            tctx.drawImage(video, 0, 0, tw, th);
            tctx.restore();
            onFrame(thumb.toDataURL("image/jpeg", 0.6));
          }
        } catch {}
        rafRef.current = requestAnimationFrame(loop);
      };
      loop();
    } catch (e: any) {
      if (!error)
        setError(e?.message || "Could not access webcam. Check browser permissions.");
      stop();
    }
  };

  const handleImage = async (file: File) => {
    setError(null);
    stop();
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    try {
      const model = await ensureModel();
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });
      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const preds: Prediction[] = await model.predict(canvas);
      onPrediction(preds);
    } catch (e: any) {
      // error already set in ensureModel
    }
  };

  useEffect(() => () => stop(), []);

  return (
    <div className="space-y-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted shadow-card">
        {imgUrl ? (
          <img src={imgUrl} alt="Uploaded posture" className="h-full w-full object-cover" />
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            className={cn(
              "h-full w-full object-cover -scale-x-100",
              (!running || blurBg) && "opacity-0",
              !running && "absolute inset-0"
            )}
          />
        )}

        {running && blurBg && !imgUrl && (
          <canvas
            ref={displayCanvasRef}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {!running && !imgUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Camera className="h-10 w-10 text-primary" />
            </div>
            <p className="font-medium">Camera is off</p>
            <p className="text-sm">Start the webcam or upload an image to analyze posture</p>
          </div>
        )}

        {running && (
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-danger/90 px-3 py-1.5 text-xs font-semibold text-white">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            LIVE
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Loading AI model…</p>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {!running ? (
          <Button onClick={start} size="lg" className="gap-2">
            <Camera className="h-4 w-4" /> Start Webcam
          </Button>
        ) : (
          <Button onClick={stop} size="lg" variant="destructive" className="gap-2">
            <CameraOff className="h-4 w-4" /> Stop
          </Button>
        )}

        <Button
          variant="outline"
          size="lg"
          className="gap-2"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-4 w-4" /> Upload Image
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImage(f);
            e.target.value = "";
          }}
        />

        <div className="ml-auto flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <Label htmlFor="blur-bg" className="cursor-pointer text-sm font-medium">
            Blur background
          </Label>
          <Switch id="blur-bg" checked={blurBg} onCheckedChange={setBlurBg} />
        </div>
      </div>
    </div>
  );
};
