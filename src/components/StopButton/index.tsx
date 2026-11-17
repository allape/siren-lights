import { useTranslation } from "react-i18next";
import styles from "./style.module.scss";

interface StopButtonProps {
  onStop: () => void;
}

export function StopButton({ onStop }: StopButtonProps) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      className={styles.button}
      onClick={onStop}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <span className={styles.icon} aria-hidden="true" />
      <span>{t("stop")}</span>
    </button>
  );
}
