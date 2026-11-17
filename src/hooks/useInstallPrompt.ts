import { useSyncExternalStore } from "react";
import { getInstallState, subscribeInstallState, type InstallState } from "../lib/pwa";

/** Tracks whether the browser can install the app right now. */
export function useInstallPrompt(): InstallState {
  return useSyncExternalStore(subscribeInstallState, getInstallState, getInstallState);
}
