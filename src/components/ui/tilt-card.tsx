"use client";

import { useRef, type ReactNode, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  intensity?: number;
  glowColor?: string;
}

export function TiltCard({
  children,
  className,
  style,
  intensity = 8,
  glowColor = "rgba(80, 70, 229, 0.10)",
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -intensity;
    const rotY = ((x - cx) / cx) * intensity;
    el.style.transition = "transform 80ms ease-out, box-shadow 80ms ease-out";
    el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px) scale(1.01)`;
    el.style.boxShadow = `0 20px 40px -8px rgba(0,0,0,0.14), 0 0 0 1px rgba(80,70,229,0.06)`;
    el.style.setProperty("--glow-x", `${x}px`);
    el.style.setProperty("--glow-y", `${y}px`);
    el.style.setProperty("--glow-opacity", "1");
  }

  function onMouseLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 500ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 500ms cubic-bezier(0.16, 1, 0.3, 1)";
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)";
    el.style.boxShadow = "";
    el.style.setProperty("--glow-opacity", "0");
  }

  return (
    <div
      ref={ref}
      className={cn("relative", className)}
      style={{ transformStyle: "preserve-3d", willChange: "transform", ...style }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Mouse-follow glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] z-10 transition-opacity duration-300"
        style={{
          background: `radial-gradient(280px circle at var(--glow-x, 50%) var(--glow-y, 50%), ${glowColor}, transparent 70%)`,
          opacity: "var(--glow-opacity, 0)",
        } as CSSProperties}
      />
      {children}
    </div>
  );
}
