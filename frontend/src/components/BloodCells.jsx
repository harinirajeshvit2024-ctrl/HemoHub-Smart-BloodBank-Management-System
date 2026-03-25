import { useEffect, useRef } from "react";

export default function BloodCells() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create blood cells
    const cells = Array.from({ length: 18 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 40 + 20,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.06 + 0.02,
      pulse: Math.random() * Math.PI * 2
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      cells.forEach(cell => {
        cell.x += cell.vx;
        cell.y += cell.vy;
        cell.pulse += 0.01;

        // Wrap around
        if (cell.x < -cell.r) cell.x = canvas.width + cell.r;
        if (cell.x > canvas.width + cell.r) cell.x = -cell.r;
        if (cell.y < -cell.r) cell.y = canvas.height + cell.r;
        if (cell.y > canvas.height + cell.r) cell.y = -cell.r;

        const pulseOpacity = cell.opacity + Math.sin(cell.pulse) * 0.02;
        const pulseR = cell.r + Math.sin(cell.pulse) * 3;

        // Draw blood cell shape (biconcave disc from top)
        ctx.save();
        ctx.translate(cell.x, cell.y);

        // Outer circle
        ctx.beginPath();
        ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(180, 0, 0, ${pulseOpacity * 2})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner dimple
        ctx.beginPath();
        ctx.arc(0, 0, pulseR * 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(139, 0, 0, ${pulseOpacity})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Fill
        ctx.beginPath();
        ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 0, 0, ${pulseOpacity * 0.4})`;
        ctx.fill();

        ctx.restore();
      });

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