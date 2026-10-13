import { useRef, useState, useCallback, useEffect } from 'react';

interface Logo3DProps {
  size?: number;
  className?: string;
}

export function Logo3D({ size = 460, className = '' }: Logo3DProps) {
  const responsiveStyle: React.CSSProperties = {
    width: 'min(80vw, 460px)',
    height: 'min(80vw, 460px)',
    maxWidth: size,
    maxHeight: size,
  };
  const stageRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef({ x: -8, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const autoRotateRef = useRef(true);
  const [transform, setTransform] = useState('perspective(1200px) rotateX(-8deg) rotateY(0deg)');

  const applyTransform = useCallback(() => {
    const { x, y } = rotationRef.current;
    setTransform(`perspective(1200px) rotateX(${x}deg) rotateY(${y}deg)`);
  }, []);

  const tick = useCallback(() => {
    if (!draggingRef.current) {
      if (autoRotateRef.current) {
        rotationRef.current.y += 0.35;
      }
      // inertia after drag
      if (Math.abs(velocityRef.current.y) > 0.05 || Math.abs(velocityRef.current.x) > 0.05) {
        rotationRef.current.y += velocityRef.current.y;
        rotationRef.current.x += velocityRef.current.x;
        velocityRef.current.x *= 0.95;
        velocityRef.current.y *= 0.95;
        // clamp x rotation
        rotationRef.current.x = Math.max(-60, Math.min(60, rotationRef.current.x));
      }
      // keep y in 0-360 range
      if (rotationRef.current.y > 360) rotationRef.current.y -= 360;
      if (rotationRef.current.y < 0) rotationRef.current.y += 360;
    }
    applyTransform();
    rafRef.current = requestAnimationFrame(tick);
  }, [applyTransform]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [tick]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    draggingRef.current = true;
    autoRotateRef.current = false;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastPointerRef.current.x;
    const dy = e.clientY - lastPointerRef.current.y;
    velocityRef.current = { x: dy * 0.4, y: dx * 0.5 };
    rotationRef.current.y += dx * 0.5;
    rotationRef.current.x += dy * 0.4;
    rotationRef.current.x = Math.max(-60, Math.min(60, rotationRef.current.x));
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    draggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    // resume auto-rotate after a brief pause
    setTimeout(() => { autoRotateRef.current = true; }, 3000);
  }, []);

  // keyboard rotation
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    autoRotateRef.current = false;
    switch (e.key) {
      case 'ArrowLeft': rotationRef.current.y -= 15; break;
      case 'ArrowRight': rotationRef.current.y += 15; break;
      case 'ArrowUp': rotationRef.current.x = Math.max(-60, rotationRef.current.x - 10); break;
      case 'ArrowDown': rotationRef.current.x = Math.min(60, rotationRef.current.x + 10); break;
      default: return;
    }
    e.preventDefault();
    applyTransform();
    setTimeout(() => { autoRotateRef.current = true; }, 3000);
  }, [applyTransform]);

  return (
    <div
      ref={stageRef}
      className={`logo-3d-stage select-none ${className}`}
      style={responsiveStyle}
    >
      {/* Glow halo */}
      <div
        className="absolute inset-0 rounded-full bg-gradient-radial from-cyan-400/20 via-green-400/5 to-transparent blur-3xl logo-3d-glow"
        aria-hidden="true"
      />
      <div
        className="relative w-full h-full rounded-full cursor-grab active:cursor-grabbing"
        style={{
          transform,
          transformStyle: 'preserve-3d',
          transition: draggingRef.current ? 'none' : undefined,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="img"
        aria-label="Air Quality Monitor 3D logo — drag to rotate, or use arrow keys"
      >
        <img
          src="/images/Air_Quality_Marker_Badge.png"
          alt=""
          className="w-full h-full rounded-full object-cover drop-shadow-[0_0_60px_rgba(22,201,245,0.4)] pointer-events-none"
          draggable={false}
        />
      </div>
    </div>
  );
}
