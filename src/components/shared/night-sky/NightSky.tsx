import { useEffect } from "react";
import styles from "./NightSky.module.css";

interface NightSkyProps {
  starCount?: number;
}

export default function NightSky({ starCount = 240 }: Readonly<NightSkyProps>) {
  useEffect(() => {
    const container = document.getElementById("star-container");
    if (!container) return;

    // Clear previous stars (in case component remounts)
    container.innerHTML = "";

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("div");
      star.className = styles.star;
      star.style.top = `${Math.random() * 100}%`;
      star.style.left = `${Math.random() * 100}%`;

      const size = Math.random() * 2 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;

      star.style.setProperty("--twinkle-duration", `${2 + Math.random() * 4}s`);
      star.style.setProperty("--twinkle-delay", `${Math.random() * 15}s`);

      container.appendChild(star);
    }
  }, [starCount]);

  return (
    <div className={styles.sky}>
      <div className={styles.starsLayer}>
        <div id="star-container"></div>
      </div>
    </div>
  );
}
