"use client";
import { useEffect, useRef } from "react";
import styles from "./petals.module.css";

export default function PetalsEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", resize);

    const petals: any[] = [];
    for (let i = 0; i < 30; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        w: Math.random() * 15 + 10,
        h: Math.random() * 15 + 10,
        vy: Math.random() * 1 + 0.5,
        vx: Math.random() * 1 - 0.5,
        r: Math.random() * 360,
        vr: Math.random() * 2 - 1
      });
    }

    let animationId: number;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(232, 190, 195, 0.6)"; // petal color
      
      petals.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.r * Math.PI) / 180);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.w, p.h, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();

        p.y += p.vy;
        p.x += p.vx;
        p.r += p.vr;

        if (p.y > height) {
          p.y = -20;
          p.x = Math.random() * width;
        }
      });
      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}
