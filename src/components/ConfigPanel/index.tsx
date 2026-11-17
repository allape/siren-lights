import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import type { SirenConfig } from "../../lib/config";
import { STANDARD_IDS } from "../../lib/standards";
import styles from "./style.module.scss";

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

  const panelStyle = {
    "--red-color": config.red,
    "--blue-color": config.blue,
  } as CSSProperties;

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
          <button
            type="button"
            className={styles.languageButton}
            onClick={onToggleLanguage}
            aria-label={t("language.aria")}
          >
            {t("language.switch")}
          </button>
        </header>

        <div className={styles.colors}>
          <ColorField
            id="siren-red"
            label={t("config.red")}
            value={config.red}
            onChange={(value) => onChange({ ...config, red: value })}
          />
          <ColorField
            id="siren-blue"
            label={t("config.blue")}
            value={config.blue}
            onChange={(value) => onChange({ ...config, blue: value })}
          />
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
