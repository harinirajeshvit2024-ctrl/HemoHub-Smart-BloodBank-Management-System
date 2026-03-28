import { useEffect, useRef } from "react";

export default function EmergencyBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    let scanY = 0;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Pulsing orbs
    const orbs = [
      { x: 0.15, y: 0.2,  r: 320, phase: 0 },
      { x: 0.85, y: 0.75, r: 280, phase: Math.PI },
      { x: 0.5,  y: 0.5,  r: 200, phase: Math.PI / 2 }
    ];

    let t = 0;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;

      // Deep dark base
      ctx.fillStyle = "#0a0203";
      ctx.fillRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = "rgba(139,0,0,0.07)";
      ctx.lineWidth = 1;
      const gridSize = 48;
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Glowing orbs
      orbs.forEach(orb => {
        const pulse  = 0.5 + 0.5 * Math.sin(t * 0.012 + orb.phase);
        const alpha  = 0.06 + pulse * 0.10;
        const radius = orb.r + pulse * 40;
        const grd    = ctx.createRadialGradient(
          orb.x * W, orb.y * H, 0,
          orb.x * W, orb.y * H, radius
        );
        grd.addColorStop(0, `rgba(160,0,0,${alpha})`);
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);
      });

      // Horizontal scan line
      scanY += 0.6;
      if (scanY > H) scanY = 0;
      const scanGrd = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
      scanGrd.addColorStop(0,   "rgba(200,0,0,0)");
      scanGrd.addColorStop(0.5, "rgba(200,0,0,0.06)");
      scanGrd.addColorStop(1,   "rgba(200,0,0,0)");
      ctx.fillStyle = scanGrd;
      ctx.fillRect(0, scanY - 40, W, 80);

      // Corner brackets
      const bSize = 36;
      const bGap  = 24;
      ctx.strokeStyle = "rgba(180,0,0,0.35)";
      ctx.lineWidth   = 1.5;
      // Top-left
      ctx.beginPath(); ctx.moveTo(bGap + bSize, bGap); ctx.lineTo(bGap, bGap); ctx.lineTo(bGap, bGap + bSize); ctx.stroke();
      // Top-right
      ctx.beginPath(); ctx.moveTo(W - bGap - bSize, bGap); ctx.lineTo(W - bGap, bGap); ctx.lineTo(W - bGap, bGap + bSize); ctx.stroke();
      // Bottom-left
      ctx.beginPath(); ctx.moveTo(bGap + bSize, H - bGap); ctx.lineTo(bGap, H - bGap); ctx.lineTo(bGap, H - bGap - bSize); ctx.stroke();
      // Bottom-right
      ctx.beginPath(); ctx.moveTo(W - bGap - bSize, H - bGap); ctx.lineTo(W - bGap, H - bGap); ctx.lineTo(W - bGap, H - bGap - bSize); ctx.stroke();

      // Subtle vertical accent lines
      ctx.strokeStyle = "rgba(139,0,0,0.06)";
      ctx.lineWidth   = 1;
      [0.25, 0.75].forEach(frac => {
        ctx.beginPath();
        ctx.moveTo(frac * W, 0);
        ctx.lineTo(frac * W, H);
        ctx.stroke();
      });

      t++;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100%", height: "100%",
        pointerEvents: "none",
        zIndex: 0
      }}
    />
  );
}