import { useEffect, useState } from "react";
import type { FlashStep } from "../lib/standards";

export interface LampState {
  red: boolean;
  blue: boolean;
}

const STEADY: LampState = { red: true, blue: true };

/**
 * Drives the two lamps from a flash pattern. While `active` is false both
 * lamps stay lit (steady preview for the configuration screen).
 */
export function useFlashing(active: boolean, steps: readonly FlashStep[]): LampState {
  const [lamps, setLamps] = useState<LampState>(STEADY);

  useEffect(() => {
    if (!active || steps.length === 0) return;

    let index = 0;
    let timer = 0;

    const tick = () => {
      const step = steps[index];
      setLamps({ red: step.red, blue: step.blue });
      index = (index + 1) % steps.length;
      timer = window.setTimeout(tick, step.duration);
    };

    // Scheduling the first step keeps state updates out of the effect body.
    timer = window.setTimeout(tick, 0);

    return () => window.clearTimeout(timer);
  }, [active, steps]);

  return active ? lamps : STEADY;
}
