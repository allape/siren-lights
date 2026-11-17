import type { CSSProperties } from "react";
import styles from "./style.module.scss";

interface SirenStageProps {
  red: string;
  blue: string;
  redOn: boolean;
  blueOn: boolean;
}

export function SirenStage({ red, blue, redOn, blueOn }: SirenStageProps) {
  const stageStyle = {
    "--red-color": red,
    "--blue-color": blue,
  } as CSSProperties;

  return (
    <div className={styles.stage} style={stageStyle}>
      <div
        className={`${styles.lamp} ${styles.red} ${redOn ? styles.on : ""}`}
        role="presentation"
      />
      <div
        className={`${styles.lamp} ${styles.blue} ${blueOn ? styles.on : ""}`}
        role="presentation"
      />
    </div>
  );
}
