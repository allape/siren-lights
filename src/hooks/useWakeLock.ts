import { useEffect } from "react";

/**
 * Keeps the screen awake while the siren is running. The lock is re-acquired
 * when the tab becomes visible again (browsers release it on hide) and retried
 * on interaction for platforms that require a user gesture.
 */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let pending = false;
    let disposed = false;

    const acquire = async () => {
      if (disposed || sentinel || pending) return;
      if (document.visibilityState !== "visible") return;

      pending = true;

      try {
        const lock = await navigator.wakeLock.request("screen");

        if (disposed) {
          void lock.release().catch(() => undefined);
          return;
        }

        sentinel = lock;
        lock.addEventListener("release", () => {
          if (sentinel === lock) sentinel = null;
        });
      } catch {
        // The request can be refused (battery saver, permissions, insecure
        // context). Flashing continues; the screen may dim as usual.
        sentinel = null;
      } finally {
        pending = false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void acquire();
    };

    // Some platforms only grant the lock after a user gesture, which is not
    // available when a returning visitor auto-starts the siren.
    const handleInteraction = () => {
      void acquire();
    };

    void acquire();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("pointerdown", handleInteraction);

    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("pointerdown", handleInteraction);

      const current = sentinel;
      sentinel = null;
      if (current) void current.release().catch(() => undefined);
    };
  }, [active]);
}
