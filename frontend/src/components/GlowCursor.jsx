import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function GlowCursor() {
  const [mode, setMode] = useState(() => localStorage.getItem('ts_cursor') || 'orbit');
  const [hovering, setHovering] = useState(false);
  const [hoverLabel, setHoverLabel] = useState('');
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animFrame = useRef(null);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  // Smooth springs for the lagging orbit ring
  const ringX = useSpring(x, { stiffness: 220, damping: 24 });
  const ringY = useSpring(y, { stiffness: 220, damping: 24 });

  useEffect(() => {
    const handler = (e) => setMode(e.detail || localStorage.getItem('ts_cursor') || 'orbit');
    window.addEventListener('ts_cursor_changed', handler);
    return () => window.removeEventListener('ts_cursor_changed', handler);
  }, []);

  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches || mode === 'system') {
      document.body.classList.remove('custom-cursor');
      return undefined;
    }
    document.body.classList.add('custom-cursor');

    const onPointerMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);

      // Check for interactive target
      const target = e.target?.closest?.('button, a, input, select, textarea, [role="button"]');
      if (target) {
        setHovering(true);
        setHoverLabel(target.getAttribute('data-cursor') || '');
      } else {
        setHovering(false);
        setHoverLabel('');
      }

      // Add comet particles if in comet mode
      if (mode === 'comet') {
        particles.current.push({
          x: e.clientX,
          y: e.clientY,
          radius: Math.random() * 4 + 2,
          alpha: 0.8,
          color: 'rgba(34, 211, 238, ',
        });
      }
    };

    const onClick = (e) => {
      if (mode === 'spark') {
        // Spawn radial sparks
        for (let i = 0; i < 16; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 4 + 2;
          particles.current.push({
            x: e.clientX,
            y: e.clientY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: Math.random() * 3 + 1,
            alpha: 1,
            color: Math.random() > 0.5 ? 'rgba(52, 211, 153, ' : 'rgba(34, 211, 238, ',
          });
        }
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('click', onClick, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('click', onClick);
      document.body.classList.remove('custom-cursor');
    };
  }, [x, y, mode]);

  // Canvas animation loop for Comet and Spark effects
  useEffect(() => {
    if (mode !== 'comet' && mode !== 'spark') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const arr = particles.current;

      for (let i = arr.length - 1; i >= 0; i--) {
        const p = arr[i];
        if (p.vx !== undefined) {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.95;
          p.vy *= 0.95;
        }
        p.alpha -= 0.025;

        if (p.alpha <= 0) {
          arr.splice(i, 1);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.alpha})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(34, 211, 238, 0.8)';
          ctx.fill();
        }
      }
      animFrame.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrame.current);
    };
  }, [mode]);

  if (mode === 'system') return null;

  return (
    <>
      {/* Canvas for trails and sparks */}
      {(mode === 'comet' || mode === 'spark') && (
        <canvas
          ref={canvasRef}
          className="pointer-events-none fixed inset-0 z-[89] hidden [@media(pointer:fine)]:block"
        />
      )}

      {/* Orbit Ring: Lagging Outer Ring */}
      {mode === 'orbit' && (
        <motion.div
          aria-hidden="true"
          style={{
            x: ringX,
            y: ringY,
            translateX: '-50%',
            translateY: '-50%',
          }}
          className={`pointer-events-none fixed left-0 top-0 z-[90] hidden rounded-full border border-accent/80 transition-all duration-200 ease-out [@media(pointer:fine)]:flex items-center justify-center ${
            hovering
              ? 'h-12 w-12 bg-accent/20 border-accent shadow-[0_0_24px_rgba(34,211,238,0.7)]'
              : 'h-8 w-8 bg-accent/5'
          }`}
        >
          {hoverLabel && (
            <span className="text-[9px] font-mono font-bold text-accent tracking-tighter uppercase whitespace-nowrap">
              {hoverLabel}
            </span>
          )}
        </motion.div>
      )}

      {/* Center Precise Dot */}
      <motion.div
        aria-hidden="true"
        style={{
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
        }}
        className="pointer-events-none fixed left-0 top-0 z-[91] hidden h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_rgba(34,211,238,1)] [@media(pointer:fine)]:block"
      />
    </>
  );
}
