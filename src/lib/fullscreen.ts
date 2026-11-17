export async function enterFullscreen(element: HTMLElement): Promise<void> {
  if (document.fullscreenElement || typeof element.requestFullscreen !== "function") {
    return;
  }

  try {
    await element.requestFullscreen({ navigationUI: "hide" });
  } catch {
    // Fullscreen can be refused (iOS Safari, permissions, embedded frames).
    // The siren keeps running in the normal viewport instead.
  }
}

export async function exitFullscreen(): Promise<void> {
  if (!document.fullscreenElement) return;

  try {
    await document.exitFullscreen();
  } catch {
    // Nothing else to do: the page is already usable without fullscreen.
  }
}
