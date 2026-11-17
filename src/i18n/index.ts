import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { loadLanguage, type Language } from "../lib/config";
import { resources } from "./resources";

function detectLanguage(): Language {
  const stored = loadLanguage();
  if (stored) return stored;

  return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

const language = detectLanguage();

// `initAsync: false` applies the bundled resources synchronously, so the very
// first render already has translations available.
void i18n.use(initReactI18next).init({
  resources,
  lng: language,
  fallbackLng: "zh",
  supportedLngs: ["zh", "en"],
  interpolation: { escapeValue: false },
  initAsync: false,
});

document.documentElement.lang = language === "zh" ? "zh-CN" : "en";

export default i18n;
