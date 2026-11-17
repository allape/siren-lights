export type ColorPresetId = "white" | "pure" | "gb" | "us" | "eu";

export interface ColorPreset {
  id: ColorPresetId;
  hex: string;
}

/*
 * GB 13954, SAE J845 and ECE R65 define the emitted light colour by
 * chromaticity rather than by a fixed screen RGB value, so these standard
 * presets are vivid sRGB approximations for display use - not certified
 * colour samples.
 */
export const RED_PRESETS: readonly ColorPreset[] = [
  { id: "white", hex: "#ffffff" },
  { id: "pure", hex: "#ff0000" },
  { id: "gb", hex: "#ff1f2d" },
  { id: "us", hex: "#ff2a00" },
  { id: "eu", hex: "#e60012" },
];

export const BLUE_PRESETS: readonly ColorPreset[] = [
  { id: "white", hex: "#ffffff" },
  { id: "pure", hex: "#0000ff" },
  { id: "gb", hex: "#1f6bff" },
  { id: "us", hex: "#0033ff" },
  { id: "eu", hex: "#0057b8" },
];
