import type { StandardId } from "./standards";

export type Language = "zh" | "en";

export interface SirenConfig {
  red: string;
  blue: string;
  standard: StandardId;
}

export const DEFAULT_CONFIG: SirenConfig = {
  red: "#ff1f2d",
  blue: "#1f6bff",
  standard: "gb",
};

const CONFIG_STORAGE_KEY = "siren-lights:config:v1";
const LANGUAGE_STORAGE_KEY = "siren-lights:language:v1";
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

function isStandardId(value: unknown): value is StandardId {
  return value === "gb" || value === "us" || value === "eu";
}

function readStoredValue(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Reads the persisted configuration. Returns `null` for a first-time visitor
 * (or when the stored value is missing / corrupted).
 */
export function loadConfig(): SirenConfig | null {
  const raw = readStoredValue(CONFIG_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;

    const { red, blue, standard } = parsed;
    if (typeof red !== "string" || !HEX_COLOR_PATTERN.test(red)) return null;
    if (typeof blue !== "string" || !HEX_COLOR_PATTERN.test(blue)) return null;
    if (!isStandardId(standard)) return null;

    return { red, blue, standard };
  } catch {
    return null;
  }
}

export function saveConfig(config: SirenConfig): void {
  try {
    window.localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Storage can be unavailable (private mode, blocked cookies); the app
    // still works and simply asks for confirmation again next time.
  }
}

export function loadLanguage(): Language | null {
  const value = readStoredValue(LANGUAGE_STORAGE_KEY);
  return value === "zh" || value === "en" ? value : null;
}

export function saveLanguage(language: Language): void {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore storage failures.
  }
}
