import React from "react";
import styles from "./MaestroRobot.module.css";

export type MaestroRobotState =
  | "idle"
  | "idea"
  | "listening"
  | "thinking"
  | "talking";

export interface MaestroRobotProps {
  state?: MaestroRobotState;
  size?: number | string;
  decorative?: boolean;
  className?: string;
  robotColor?: string;
  eyeColor?: string;
  ariaLabel?: string;
}

const MaestroRobot: React.FC<MaestroRobotProps> = ({
  state = "idle",
  size = 120,
  decorative = false,
  className,
  robotColor,
  eyeColor,
  ariaLabel = "Maestro",
}) => {
  const robotClassName = [styles.robot, className].filter(Boolean).join(" ");
  const style = {
    width: size,
    height: "auto",
    ["--robot" as string]: robotColor,
    ["--eye" as string]: eyeColor,
  } as React.CSSProperties;

  return (
    <svg
      className={robotClassName}
      data-state={state}
      viewBox="0 0 240 260"
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : ariaLabel}
      focusable="false"
      style={style}
    >
      <g className={styles.robotBody}>
        <g className={styles.robotHead}>
          <rect
            className={styles.robotAntenna}
            x="110"
            y="16"
            width="20"
            height="30"
            rx="5"
          />
          <rect x="40" y="42" width="160" height="108" rx="38" />
          <g className={styles.robotEyes}>
            <circle cx="93" cy="96" r="17" />
            <circle cx="147" cy="96" r="17" />
          </g>
        </g>
        <path d="M44 250 A78 78 0 0 1 196 250 Z" />
      </g>
    </svg>
  );
};

export default MaestroRobot;
