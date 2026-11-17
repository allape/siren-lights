/**
 * PWA plumbing shared by the app: service-worker registration and the
 * "add to home screen" install prompt.
 *
 * The app is a single self-contained HTML document, so the service worker only
 * has to keep that document (plus the manifest and the icons) available while
 * offline. See `public/sw.js` for the caching strategy.
 */

const SERVICE_WORKER_URL = "sw.js";

/**
 * `beforeinstallprompt` is not part of the DOM typings because it is still
 * Chromium-specific; this is the shape Chromium uses.
 */
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export type InstallState = "installed" | "installable" | "ios-hint" | "unavailable";

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installedThisSession = false;
const subscribers = new Set<() => void>();

function emit(): void {
  for (const subscriber of subscribers) subscriber();
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;

  const displayModes = [
    "standalone",
    "minimal-ui",
    "fullscreen",
    "window-controls-overlay",
  ];
  if (displayModes.some((mode) => window.matchMedia(`(display-mode: ${mode})`).matches)) {
    return true;
  }

  // iOS Safari does not report display-mode before 16.4.
  const legacyNavigator = navigator as Navigator & { standalone?: boolean };
  return legacyNavigator.standalone === true;
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) return true;
  // iPadOS 13 and later report a desktop Safari user agent.
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

/**
 * Snapshot used by `useSyncExternalStore`; returns a primitive so React can
 * bail out of re-rendering when nothing changed.
 */
export function getInstallState(): InstallState {
  if (installedThisSession || isStandalone()) return "installed";
  if (deferredPrompt) return "installable";
  // On iOS every browser installs through the share sheet instead.
  if (isIos()) return "ios-hint";
  return "unavailable";
}

export function subscribeInstallState(callback: () => void): () => void {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

/** Resolves to `true` when the user accepted the install prompt. */
export async function promptInstall(): Promise<boolean> {
  const event = deferredPrompt;
  if (!event) return false;

  // The event can only be used once; Chromium may fire a new one later.
  deferredPrompt = null;
  emit();

  try {
    await event.prompt();
    const { outcome } = await event.userChoice;
    return outcome === "accepted";
  } catch {
    return false;
  }
}

window.addEventListener("beforeinstallprompt", (event) => {
  // Suppress the browser's mini-infobar and use the in-app button instead.
  event.preventDefault();
  deferredPrompt = event as BeforeInstallPromptEvent;
  emit();
});

window.addEventListener("appinstalled", () => {
  deferredPrompt = null;
  installedThisSession = true;
  emit();
});

/**
 * Registers the service worker in production builds served over HTTPS (or
 * localhost). Registering in dev would cache Vite's dev modules, so it is
 * deliberately skipped there; `file://` and plain-HTTP origins cannot use
 * service workers at all.
 */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD) return;
  if (!("serviceWorker" in navigator)) return;
  if (!window.isSecureContext) return;

  const register = () => {
    const url = new URL(SERVICE_WORKER_URL, document.baseURI);
    navigator.serviceWorker.register(url, { updateViaCache: "none" }).catch(() => {
      // Offline support is a progressive enhancement; never break the app.
    });
  };

  if (document.readyState === "complete") {
    register();
  } else {
    window.addEventListener("load", register, { once: true });
  }
}
