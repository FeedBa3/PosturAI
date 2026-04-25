// Default Teachable Machine model URL.
// Users can override this at runtime via the Settings page (stored in localStorage).
export const DEFAULT_MODEL_URL =
  "https://teachablemachine.withgoogle.com/models/e9uE81yJ0/";

const STORAGE_KEY = "posturai:model-url";

export function getModelUrl(): string {
  if (typeof window === "undefined") return DEFAULT_MODEL_URL;
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_MODEL_URL;
}

export function setModelUrl(url: string) {
  if (typeof window === "undefined") return;
  if (url && url.trim()) {
    localStorage.setItem(STORAGE_KEY, url.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Backwards-compat export (some components may still import this)
export const TEACHABLE_MODEL_URL = DEFAULT_MODEL_URL;

// Map any class name from your model to "good" or "bad".
export const GOOD_LABELS = ["good", "good posture", "correct", "upright"];
export const BAD_LABELS = ["bad", "bad posture", "slouch", "slouching", "incorrect", "hunched"];
