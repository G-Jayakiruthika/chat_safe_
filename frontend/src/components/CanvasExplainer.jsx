import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Download, Sparkles, Volume2, Shield, Video } from 'lucide-react';

const CHAPTERS = [
  { t: 0, title: '01 · Rural Speed-Dial 9', sub: 'Elderly father calls Voice AI from Nokia keypad phone in Tamil.' },
  { t: 12, title: '02 · Gemini Intent Recognition', sub: 'Gemini instantly routes between Scam (Kavach) and Civic Issue (Urimai).' },
  { t: 25, title: '03 · Multi-Modal AI Handoff', sub: 'Voice AI drafts petition and alerts tech-savvy son\'s web dashboard.' },
  { t: 38, title: '04 · Actionable Urimai Kit', sub: 'Son attaches site photo, generates PDF with 5-resident signature block.' },
  { t: 50, title: '05 · Digital India Bypass', sub: 'Remote son 1-click copies draft to TN CM Helpline (Mudhalvarin Mugavari).' },
];

export default function CanvasExplainer() {
  const canvasRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [activeChapter, setActiveChapter] = useState(0);
  const animFrame = useRef(null);
  const lastTime = useRef(null);

  const duration = 60; // 60-second animated story

  useEffect(() => {
    const cur = CHAPTERS.slice().reverse().find((c) => seconds >= c.t) || CHAPTERS[0];
    const idx = CHAPTERS.findIndex((c) => c.title === cur.title);
    if (idx !== -1) setActiveChapter(idx);
  }, [seconds]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = (now) => {
      if (!lastTime.current) lastTime.current = now;
      const delta = (now - lastTime.current) / 1000;
      lastTime.current = now;

      if (playing) {
        setSeconds((prev) => {
          const next = prev + delta;
          if (next >= duration) {
            setPlaying(false);
            return duration;
          }
          return next;
        });
      }

      const w = canvas.width;
      const h = canvas.height;

      // Dark Futuristic Grid Canvas
      ctx.fillStyle = '#080d1a';
      ctx.fillRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Time Progress Visualizer
      const t = seconds;
      const ch = CHAPTERS[activeChapter];

      // Draw Glowing Shield/Core based on chapter
      ctx.save();
      ctx.translate(w / 2, h / 2 - 20);

      // Rotating Orbital Rings
      const rot = t * 0.8;
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 110, 50, rot, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 90, 40, -rot * 1.2, 0, Math.PI * 2);
      ctx.stroke();

      // Central Pulse Node
      const pulse = 24 + Math.sin(t * 4) * 4;
      const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, pulse + 20);
      grad.addColorStop(0, '#22d3ee');
      grad.addColorStop(0.5, '#34d399');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, pulse + 20, 0, Math.PI * 2);
      ctx.fill();

      // Icon Center
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const iconChar = activeChapter === 0 ? '📞' : activeChapter === 1 ? '✨' : activeChapter === 2 ? '⚡' : activeChapter === 3 ? '📋' : '🏛️';
      ctx.fillText(iconChar, 0, 0);

      ctx.restore();

      // Bottom Subtitles & Telemetry
      ctx.fillStyle = '#22d3ee';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(ch.title, w / 2, h - 70);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px sans-serif';
      ctx.fillText(ch.sub, w / 2, h - 45);

      animFrame.current = requestAnimationFrame(render);
    };

    animFrame.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrame.current);
  }, [playing, seconds, activeChapter]);

  const togglePlay = () => setPlaying(!playing);
  const restart = () => {
    setSeconds(0);
    setPlaying(true);
  };

  const jumpTo = (timeSec) => {
    setSeconds(timeSec);
  };

  return (
    <div className="card overflow-hidden border border-fg/20 bg-bg p-5 shadow-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-fg/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
            <Video size={18} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold sm:text-base">02 — Watch TrueSafe Think</h3>
            <p className="text-[11px] text-muted">60-Second Real-Time Canvas Story</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={restart}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-fg/20 text-muted hover:text-fg hover:bg-fg/10"
            title="Restart from beginning"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={togglePlay}
            className="btn-primary !min-h-[34px] !py-1 !px-3 text-xs font-bold shadow-md"
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
            <span>{playing ? 'Pause' : 'Play Story'}</span>
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-fg/20 bg-[#080d1a] shadow-inner">
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          className="h-full w-full object-contain"
        />

        {/* Floating Chapter Pill */}
        <div className="absolute top-3 left-3 rounded-full bg-black/70 px-3 py-1 text-[11px] font-mono text-cyan-400 backdrop-blur-md border border-cyan-500/30">
          CHAPTER {activeChapter + 1} OF 5
        </div>

        {/* Live Scrubber Timeline */}
        <div className="absolute bottom-2 inset-x-3 flex items-center gap-2 rounded-xl bg-black/60 px-3 py-1.5 backdrop-blur-md">
          <span className="font-mono text-[10px] text-slate-300">
            0:{Math.floor(seconds).toString().padStart(2, '0')} / 1:00
          </span>
          <div className="relative h-1.5 flex-1 rounded-full bg-white/20 cursor-pointer overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
              style={{ width: `${(seconds / duration) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Clickable Chapter Selector */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 text-left">
        {CHAPTERS.map((c, i) => (
          <button
            key={i}
            onClick={() => jumpTo(c.t)}
            className={`rounded-xl border p-2 text-xs transition ${
              activeChapter === i
                ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 font-bold shadow-sm'
                : 'border-fg/10 bg-fg/5 text-muted hover:border-fg/30'
            }`}
          >
            <p className="font-mono text-[10px]">{c.title.split('·')[0]}</p>
            <p className="line-clamp-1 text-[11px] font-medium">{c.title.split('·')[1]}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
