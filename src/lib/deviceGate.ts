export type DeviceGateStatus = {
  ok: boolean;
  reason: "ok" | "width" | "height" | "orientation" | "unknown";
  width: number;
  height: number;
  landscape: boolean;
  /** Informational only; does not block access. */
  isMobile: boolean;
};

export const MIN_WIDTH = 1280;
export const MIN_HEIGHT = 800;

function safeWindowSize() {
  if (typeof window === "undefined") return { width: 0, height: 0 };
  return { width: window.innerWidth, height: window.innerHeight };
}

function isLandscape() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(orientation: landscape)").matches;
}

function detectMobileUserAgent() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    ua
  );
}

export function getDeviceGateStatus(): DeviceGateStatus {
  const { width, height } = safeWindowSize();
  const landscape = isLandscape();

  const uaMobile = detectMobileUserAgent();
  const coarsePointer =
    typeof window !== "undefined" &&
    window.matchMedia?.("(pointer: coarse)")?.matches;
  const isMobile = Boolean(uaMobile || coarsePointer);

  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    return {
      ok: false,
      reason: "unknown",
      width: 0,
      height: 0,
      landscape,
      isMobile,
    };
  }

  // Gate rules: only resolution + orientation.
  if (width < MIN_WIDTH) {
    return { ok: false, reason: "width", width, height, landscape, isMobile };
  }
  if (height < MIN_HEIGHT) {
    return { ok: false, reason: "height", width, height, landscape, isMobile };
  }
  if (!landscape) {
    return {
      ok: false,
      reason: "orientation",
      width,
      height,
      landscape,
      isMobile,
    };
  }

  return { ok: true, reason: "ok", width, height, landscape, isMobile };
}
