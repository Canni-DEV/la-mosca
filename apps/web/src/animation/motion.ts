export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function motionDuration(ms: number): number {
  if (prefersReducedMotion()) {
    return Math.min(80, Math.max(16, Math.round(ms * 0.12)));
  }
  return ms;
}

export function allowShake(): boolean {
  return !prefersReducedMotion();
}
