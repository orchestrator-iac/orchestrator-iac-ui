import React, { useEffect, useRef } from "react";

const BlackHole: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;
    let angle = 0;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Event Horizon
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = "black";
      ctx.fill();

      // Photon Sphere (thin glowing ring)
      const glow = ctx.createRadialGradient(
        centerX,
        centerY,
        radius,
        centerX,
        centerY,
        radius + 15,
      );
      glow.addColorStop(0, "rgba(255, 255, 200, 0.8)");
      glow.addColorStop(0.6, "rgba(255, 200, 50, 0.4)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 15, 0, Math.PI * 2);
      ctx.fill();

      // Accretion Disk
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      const grad = ctx.createLinearGradient(-200, 0, 200, 0);
      grad.addColorStop(0, "rgba(255,150,0,0)");
      grad.addColorStop(0.5, "rgba(255,200,100,1)");
      grad.addColorStop(1, "rgba(255,150,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(-200, -10, 400, 20);
      ctx.restore();

      // Lensed Disk (above + below black hole)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-angle * 0.5);
      ctx.scale(1, 0.5); // bending
      ctx.fillStyle = grad;
      ctx.fillRect(-200, -100, 400, 20);
      ctx.fillRect(-200, 100, 400, 20);
      ctx.restore();

      angle += 0.01;
      requestAnimationFrame(draw);
    }

    draw();
  }, []);

  return <canvas ref={canvasRef} style={{ display: "block" }} />;
};

export default BlackHole;
