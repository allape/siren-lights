export type StandardId = "gb" | "us" | "eu";

export interface FlashStep {
  red: boolean;
  blue: boolean;
  /** How long this step is displayed, in milliseconds. */
  duration: number;
}

export interface FlashPattern {
  steps: readonly FlashStep[];
  /** Total duration of one full pattern cycle, in milliseconds. */
  cycle: number;
}

/**
 * GB (Chinese national standard, GB 13954): red and blue alternate with a
 * single 250 ms flash each, i.e. roughly 2 flashes per second.
 */
const gbSteps: readonly FlashStep[] = [
  { red: true, blue: false, duration: 250 },
  { red: false, blue: true, duration: 250 },
];

/**
 * SAE J845 style wig-wag: each side fires two quick 80 ms bursts, the sides
 * alternate, and the whole sequence repeats once per second.
 */
const usSteps: readonly FlashStep[] = [
  { red: true, blue: false, duration: 80 },
  { red: false, blue: false, duration: 110 },
  { red: true, blue: false, duration: 80 },
  { red: false, blue: false, duration: 110 },
  { red: false, blue: true, duration: 80 },
  { red: false, blue: false, duration: 110 },
  { red: false, blue: true, duration: 80 },
  { red: false, blue: false, duration: 350 },
];

/**
 * ECE R65 style single flash: red and blue alternate every 200 ms, i.e.
 * 2.5 flashes per second.
 */
const euSteps: readonly FlashStep[] = [
  { red: true, blue: false, duration: 200 },
  { red: false, blue: true, duration: 200 },
];

function withCycle(steps: readonly FlashStep[]): FlashPattern {
  const cycle = steps.reduce((total, step) => total + step.duration, 0);
  return { steps, cycle };
}

export const STANDARDS: Record<StandardId, FlashPattern> = {
  gb: withCycle(gbSteps),
  us: withCycle(usSteps),
  eu: withCycle(euSteps),
};

export const STANDARD_IDS: readonly StandardId[] = ["gb", "us", "eu"];
