import { useEffect, useState } from "react";
import styles from "./NightSky.module.css";

interface NightSkyProps {
  starCount?: number;
}

export default function NightSky({ starCount = 240 }: Readonly<NightSkyProps>) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = document.getElementById("star-container");
    if (!container) return;

    container.innerHTML = "";

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("div");
      star.className = styles.star;
      star.style.top = `${Math.random() * 100}%`;
      star.style.left = `${Math.random() * 100}%`;

      // 1 in 100 chance → big star
      let size: number;
      if (Math.random() < 0.01) {
        // pick from 8, 14, or 24
        const bigSizes = [8, 14, 24];
        size = bigSizes[Math.floor(Math.random() * bigSizes.length)];
        star.classList.add(styles.bigStar); // optional extra glow
      } else {
        // normal small star
        size = Math.random() * 2 + 1;
      }
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;

      star.style.setProperty("--twinkle-duration", `${2 + Math.random() * 4}s`);
      star.style.setProperty("--twinkle-delay", `${Math.random() * 15}s`);

      container.appendChild(star);
    }
  }, [starCount]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        setScale((prev) => Math.min(prev + 0.1, 2));
      } else {
        setScale((prev) => Math.max(prev - 0.1, 0.5));
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div className={styles.sky}>
      <div
        className={styles.starsLayer}
        style={{
          transform: `scale(${scale})`,
        }}
      >
        <div className={styles.rotateLayer}>
          <div id="star-container"></div>
        </div>
      </div>
    </div>
  );
}
