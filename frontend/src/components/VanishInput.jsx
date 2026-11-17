import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Mic, MicOff } from 'lucide-react';
import { INDIAN_LANGUAGES } from '../lib/languages.js';

const getSrLang = (code) => {
  const match = INDIAN_LANGUAGES.find((l) => l.code === code);
  return match?.srCode || 'en-IN';
};

/** Aceternity "Vanish Input": on submit, the text dissolves into particles. Includes a Mic (Web Speech API) button. */
export default function VanishInput({ onSubmit, lang = 'en', busy }) {
  const [value, setValue] = useState(''); const [animating, setAnimating] = useState(false); const [listening, setListening] = useState(false);
  const canvas = useRef(null); const inputRef = useRef(null); const data = useRef([]); const recog = useRef(null);
  const [ph, setPh] = useState(0);
  const PH = ['Paste a suspicious SMS or WhatsApp…', 'Describe a pothole, broken light…', 'Is this call a scam?'];
  useEffect(() => { const t = setInterval(() => setPh((p) => (p + 1) % PH.length), 3000); return () => clearInterval(t); }, []);

  const draw = useCallback(() => {
    const el = inputRef.current; const c = canvas.current; if (!el || !c) return;
    c.width = 800; c.height = 800;
    const ctx = c.getContext('2d'); ctx.clearRect(0, 0, 800, 800);
    ctx.font = '32px sans-serif'; ctx.fillStyle = '#fff';
    ctx.fillText(el.value.slice(0, 40), 16, 60);
    const px = ctx.getImageData(0, 0, 800, 800).data; const out = [];
    for (let y = 0; y < 800; y += 2) for (let x = 0; x < 800; x += 2) { if (px[(y * 800 + x) * 4 + 3] > 0) out.push({ x, y, r: 1 }); }
    data.current = out;
  }, []);

  const vanish = (done) => {
    setAnimating(true);
    const ctx = canvas.current.getContext('2d'); let pos = 0;
    const step = () => {
      ctx.clearRect(0, 0, 800, 800);
      const a = data.current; pos += 14;
      for (let i = a.length - 1; i >= 0; i--) {
        const p = a[i];
        if (p.x < pos) { ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(p.x, p.y, 2, 2); a.splice(i, 1); } else { p.x += Math.random() > 0.5 ? 1 : -1; ctx.fillStyle = '#fff'; ctx.fillRect(p.x, p.y, 2, 2); }
      }
      if (a.length) requestAnimationFrame(step); else { setAnimating(false); done(); }
    };
    requestAnimationFrame(step);
  };

  const submit = (e) => {
    e.preventDefault();
    const text = value.trim(); if (!text || animating || busy) return;
    draw();
    const form = e.currentTarget;
    const hp = form.elements.website?.value; if (hp) return; // honeypot
    vanish(() => setValue(''));
    onSubmit(text);
  };

  const toggleMic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Voice input is not supported in this browser. Please type instead.'); return; }
    if (listening) { recog.current?.stop(); return; }
    const r = new SR(); r.lang = getSrLang(lang); r.interimResults = true; r.continuous = false;
    r.onresult = (ev) => setValue(Array.from(ev.results).map((x) => x[0].transcript).join(' '));
    r.onend = () => setListening(false); r.onerror = () => setListening(false);
    recog.current = r; setListening(true); r.start();
  };

  return (
    <form onSubmit={submit} className="relative mx-auto flex h-16 w-full max-w-2xl items-center overflow-hidden rounded-full border-2 border-fg/50 bg-bg/90 shadow-lg" aria-label="Scan a message">
      <canvas ref={canvas} aria-hidden="true" className={`pointer-events-none absolute left-2 top-[20%] origin-top-left scale-50 pr-20 ${animating ? 'opacity-100' : 'opacity-0'}`} style={{ filter: 'invert(0)', mixBlendMode: 'difference' }} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px]" />
      <label htmlFor="scan-input" className="sr-only">Message to analyse</label>
      <input id="scan-input" ref={inputRef} value={value} maxLength={4000} onChange={(e) => !animating && setValue(e.target.value)}
        className={`h-full w-full bg-transparent pl-6 pr-32 text-lg outline-none ${animating ? 'text-transparent' : 'text-fg'}`} />
      {!value && (
        <AnimatePresence mode="wait">
          <motion.p key={ph} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }}
            className="pointer-events-none absolute left-6 w-[calc(100%-9rem)] truncate text-muted">{PH[ph]}</motion.p>
        </AnimatePresence>
      )}
      <button type="button" onClick={toggleMic} aria-pressed={listening} aria-label={listening ? 'Stop voice input' : 'Start voice input'}
        className={`absolute right-16 flex h-11 w-11 items-center justify-center rounded-full ${listening ? 'bg-a2 text-fg animate-pulse' : 'text-fg hover:bg-fg/10'}`}>
        {listening ? <MicOff /> : <Mic />}
      </button>
      <button type="submit" disabled={!value.trim() || busy} aria-label="Analyse message"
        className="absolute right-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-onaccent disabled:opacity-50">
        <ArrowUp />
      </button>
    </form>
  );
}
