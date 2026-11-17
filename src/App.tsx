import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfigPanel } from "./components/ConfigPanel";
import { SirenStage } from "./components/SirenStage";
import { StopButton } from "./components/StopButton";
import { useFlashing } from "./hooks/useFlashing";
import { useWakeLock } from "./hooks/useWakeLock";
import {
  DEFAULT_CONFIG,
  loadConfig,
  saveConfig,
  saveLanguage,
  type Language,
  type SirenConfig,
} from "./lib/config";
import { enterFullscreen, exitFullscreen } from "./lib/fullscreen";
import { STANDARDS } from "./lib/standards";
import styles from "./style.module.scss";

type Phase = "config" | "running";

/** How long the stop button stays visible after the last interaction. */
const STOP_BUTTON_TIMEOUT_MS = 3000;

export default function App() {
  const { i18n } = useTranslation();
  const [storedConfig] = useState(loadConfig);
  const [config, setConfig] = useState<SirenConfig>(() => storedConfig ?? DEFAULT_CONFIG);
  const [phase, setPhase] = useState<Phase>(() => (storedConfig ? "running" : "config"));
  const [stopVisible, setStopVisible] = useState(false);
  const hideTimerRef = useRef<number | null>(null);

  const steps = STANDARDS[config.standard].steps;
  const lamps = useFlashing(phase === "running", steps);
  useWakeLock(phase === "running");

  const language: Language = i18n.resolvedLanguage?.startsWith("en") ? "en" : "zh";

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleStopHide = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = window.setTimeout(() => {
      hideTimerRef.current = null;
      setStopVisible(false);
    }, STOP_BUTTON_TIMEOUT_MS);
  }, [clearHideTimer]);

  useEffect(() => {
    return () => clearHideTimer();
  }, [clearHideTimer]);

  const handleSurfacePointerDown = () => {
    if (phase !== "running") return;
    setStopVisible(true);
    scheduleStopHide();
  };

  const handleSurfacePointerMove = () => {
    if (phase !== "running" || !stopVisible) return;
    scheduleStopHide();
  };

  const handleStart = () => {
    saveConfig(config);
    clearHideTimer();
    setStopVisible(false);
    void enterFullscreen(document.documentElement);
    setPhase("running");
  };

  const handleStop = () => {
    clearHideTimer();
    setStopVisible(false);
    setPhase("config");
    void exitFullscreen();
  };

  const handleToggleLanguage = () => {
    const next: Language = language === "zh" ? "en" : "zh";
    void i18n.changeLanguage(next);
    saveLanguage(next);
    document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
  };

  return (
    <main
      className={styles.app}
      onPointerDown={handleSurfacePointerDown}
      onPointerMove={handleSurfacePointerMove}
    >
      <SirenStage
        red={config.red}
        blue={config.blue}
        redOn={lamps.red}
        blueOn={lamps.blue}
      />

      {phase === "config" ? (
        <ConfigPanel
          config={config}
          onChange={setConfig}
          onStart={handleStart}
          onToggleLanguage={handleToggleLanguage}
        />
      ) : stopVisible ? (
        <StopButton onStop={handleStop} />
      ) : null}
    </main>
  );
}
