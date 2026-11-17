import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";
import { BLUE_PRESETS, RED_PRESETS } from "../../lib/colorPresets";
import type { SirenConfig } from "../../lib/config";
import { promptInstall } from "../../lib/pwa";
import { STANDARD_IDS } from "../../lib/standards";
import styles from "./style.module.scss";

const PRESETS = {
  red: RED_PRESETS,
  blue: BLUE_PRESETS,
} as const;

interface ConfigPanelProps {
  config: SirenConfig;
  onChange: (config: SirenConfig) => void;
  onStart: () => void;
  onToggleLanguage: () => void;
}

interface ColorFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorField({ id, label, value, onChange }: ColorFieldProps) {
  return (
    <label className={styles.colorField} htmlFor={id}>
      <input
        id={id}
        className={styles.colorInput}
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <span className={styles.colorText}>
        <span className={styles.colorLabel}>{label}</span>
        <span className={styles.colorValue}>{value.toUpperCase()}</span>
      </span>
    </label>
  );
}

export function ConfigPanel({
  config,
  onChange,
  onStart,
  onToggleLanguage,
}: ConfigPanelProps) {
  const { t } = useTranslation();
  const installState = useInstallPrompt();

  const panelStyle = {
    "--red-color": config.red,
    "--blue-color": config.blue,
  } as CSSProperties;

  const applyPreset = (lamp: "red" | "blue", hex: string) => {
    onChange(lamp === "red" ? { ...config, red: hex } : { ...config, blue: hex });
  };

  return (
    <div className={styles.overlay}>
      <section
        className={styles.panel}
        style={panelStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="siren-config-title"
      >
        <header className={styles.header}>
          <div className={styles.heading}>
            <h1 className={styles.title} id="siren-config-title">
              {t("config.title")}
            </h1>
            <p className={styles.subtitle}>{t("config.subtitle")}</p>
          </div>
          <div className={styles.headerActions}>
            {installState === "installable" && (
              <button
                type="button"
                className={styles.installButton}
                onClick={() => void promptInstall()}
              >
                {t("pwa.install")}
              </button>
            )}
            <button
              type="button"
              className={styles.languageButton}
              onClick={onToggleLanguage}
              aria-label={t("language.aria")}
            >
              {t("language.switch")}
            </button>
          </div>
        </header>

        {installState === "ios-hint" && (
          <p className={styles.installHint}>{t("pwa.iosHint")}</p>
        )}

        <div className={styles.colors}>
          {(["red", "blue"] as const).map((lamp) => (
            <div className={styles.color} key={lamp}>
              <ColorField
                id={`siren-${lamp}`}
                label={t(`config.${lamp}`)}
                value={config[lamp]}
                onChange={(value) => onChange({ ...config, [lamp]: value })}
              />
              <div
                className={styles.presets}
                role="group"
                aria-label={t(
                  lamp === "red" ? "config.redPresets" : "config.bluePresets",
                )}
              >
                {PRESETS[lamp].map((preset) => {
                  const active = config[lamp].toLowerCase() === preset.hex;
                  const label =
                    preset.id === "white"
                      ? t("presets.white")
                      : t(`presets.${lamp}.${preset.id}`);
                  const isStandard =
                    preset.id === "gb" || preset.id === "us" || preset.id === "eu";
                  const tooltip = `${label} ${preset.hex.toUpperCase()}${
                    isStandard ? ` · ${t("presets.approx")}` : ""
                  }`;

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      className={`${styles.presetChip} ${active ? styles.presetChipActive : ""}`}
                      style={{ "--preset-color": preset.hex } as CSSProperties}
                      aria-pressed={active}
                      title={tooltip}
                      onClick={() => applyPreset(lamp, preset.hex)}
                    >
                      <span className={styles.presetSwatch} aria-hidden="true" />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <fieldset className={styles.standards}>
          <legend className={styles.legend}>{t("config.standard")}</legend>
          <div className={styles.standardList}>
            {STANDARD_IDS.map((id) => {
              const checked = config.standard === id;

              return (
                <label
                  key={id}
                  className={`${styles.standard} ${checked ? styles.standardChecked : ""}`}
                >
                  <input
                    className={styles.radio}
                    type="radio"
                    name="flash-standard"
                    value={id}
                    checked={checked}
                    onChange={() => onChange({ ...config, standard: id })}
                  />
                  <span className={styles.standardIndicator} aria-hidden="true" />
                  <span className={styles.standardText}>
                    <span className={styles.standardName}>
                      {t(`standards.${id}.name`)}
                    </span>
                    <span className={styles.standardDetail}>
                      {t(`standards.${id}.detail`)}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <button type="button" className={styles.startButton} onClick={onStart}>
          {t("config.start")}
        </button>
        <p className={styles.note}>{t("config.note")}</p>
        <p className={styles.hint}>{t("config.nightHint")}</p>
      </section>
    </div>
  );
}
