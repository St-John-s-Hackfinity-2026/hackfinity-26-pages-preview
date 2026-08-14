import { useEffect, useRef } from "react";

type Point = { x: number; y: number };

function traceBolt(context: CanvasRenderingContext2D, from: Point, to: Point, strength: number) {
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const steps = Math.max(8, Math.round(distance / 18));
  context.beginPath();
  context.moveTo(from.x, from.y);

  for (let step = 1; step < steps; step += 1) {
    const progress = step / steps;
    const jitter = (Math.random() - 0.5) * Math.min(42, distance * 0.13) * (1 - progress * 0.55);
    const x = from.x + (to.x - from.x) * progress + jitter;
    const y = from.y + (to.y - from.y) * progress + jitter;
    context.lineTo(x, y);
  }
  context.lineTo(to.x, to.y);
  context.strokeStyle = `rgba(255, 239, 181, ${strength})`;
  context.lineWidth = 1.15;
  context.shadowColor = "rgba(255, 197, 39, .95)";
  context.shadowBlur = 18;
  context.stroke();
}

export default function LightningField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!canvas || reduceMotion.matches) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let frame = 0;
    let flashUntil = 0;
    let pointer = { x: width * 0.72, y: height * 0.35 };
    let target = pointer;

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const handlePointerMove = (event: PointerEvent) => {
      target = { x: event.clientX, y: event.clientY };
      if (Math.random() > 0.72) flashUntil = performance.now() + 85;
    };

    const animate = (time: number) => {
      context.clearRect(0, 0, width, height);
      pointer = { x: pointer.x + (target.x - pointer.x) * 0.12, y: pointer.y + (target.y - pointer.y) * 0.12 };
      const pulse = Math.sin(time / 1050) * 0.5 + 0.5;

      const ambient = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 290);
      ambient.addColorStop(0, `rgba(255, 201, 45, ${0.075 + pulse * 0.025})`);
      ambient.addColorStop(0.45, "rgba(194, 24, 49, 0.045)");
      ambient.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = ambient;
      context.fillRect(0, 0, width, height);

      if (time < flashUntil || frame % 160 === 0) {
        const edgePoint = { x: Math.random() > 0.5 ? -20 : width + 20, y: Math.random() * height * 0.88 };
        traceBolt(context, edgePoint, pointer, time < flashUntil ? 0.7 : 0.22);
        context.shadowBlur = 0;
      }

      frame += 1;
      requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    const animationFrame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="lightning-field" aria-hidden="true" />;
}
