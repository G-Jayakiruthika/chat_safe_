import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import { Check, X, Flame, Sparkles, Award, RotateCcw, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';
import { useTheme } from '../lib/theme.jsx';
import TextReveal from '../components/TextReveal.jsx';

const DECK = [
  {
    t: 'SBI: Your KYC expires today. Update immediately at http://sbi-kyc-update.in or account will be blocked.',
    scam: true,
    category: 'KYC/OTP Phishing',
    clue: 'Look at the URL—it says "sbi-kyc-update.in" instead of official "onlinesbi.sbi". Banks NEVER ask you to update KYC via SMS links.',
  },
  {
    t: 'Your OTP for Swiggy food delivery is 482913. Valid for 10 minutes. Do not share with anyone.',
    scam: false,
    category: 'Genuine Delivery OTP',
    clue: 'You ordered food yourself, the message explicitly warns you NOT to share it, and it contains no suspicious external URLs.',
  },
  {
    t: 'This is CBI Cyber Cell. A courier parcel in your name contains narcotics. Stay on video call – you are under digital arrest.',
    scam: true,
    category: 'Digital Arrest Extortion',
    clue: 'No police, court, or CBI agency conducts "digital arrests" or investigations via video calls. Authority + fear is the classic giveaway.',
  },
  {
    t: 'Amma, this is a new number. I lost my phone during travel. Please urgently send ₹15,000 via GPay, I will explain tonight.',
    scam: true,
    category: 'AI Voice & Family Impersonation',
    clue: 'Emotional urgency from a strange new number. Always call the parent/child\'s known original number or ask a family-only secret code word.',
  },
  {
    t: 'Your TNEB electricity bill of ₹1,240 is due on 20 Nov. Pay on official TANGEDCO portal or counter.',
    scam: false,
    category: 'Official Utility Reminder',
    clue: 'Routine notification with no countdown threat of "power cut tonight", no personal WhatsApp number, and directs to official counter.',
  },
  {
    t: 'India Post: Your package address is missing. Update within 12 hours at http://inida-post.com/track to avoid return.',
    scam: true,
    category: 'Postal Phishing',
    clue: 'Notice the spelling mistake in the domain: "inida-post.com" instead of "indiapost.gov.in". Postal services do not send address-update links.',
  },
  {
    t: 'Earn ₹3,000 to ₹8,000/day by liking YouTube videos and rating hotels on Google Maps. Join our Telegram task group.',
    scam: true,
    category: 'Part-Time Task Job Trap',
    clue: 'Scammers pay a tiny ₹150 first to gain your trust, then demand huge "security deposits" to unlock VIP withdrawal tasks.',
  },
];

export default function Streak() {
  const { setState } = useTheme();
  const [i, setI] = useState(0);
  const [streak, setStreak] = useState(() => Number(localStorage.getItem('ts_streak')) || 4);
  const [fb, setFb] = useState(null);
  const [score, setScore] = useState(0);
  const x = useMotionValue(0);
  const rot = useTransform(x, [-200, 200], [-14, 14]);
  const safeOp = useTransform(x, [0, 100], [0, 1]);
  const scamOp = useTransform(x, [-100, 0], [1, 0]);
  const busy = useRef(false);

  useEffect(() => {
    setState('safe');
    return () => setState('neutral');
  }, [setState]);

  const answer = (saysScam) => {
    if (busy.current || fb) return;
    busy.current = true;
    const card = DECK[i];
    const right = saysScam === card.scam;
    const ns = right ? streak + 1 : Math.max(0, streak - 1);
    setStreak(ns);
    localStorage.setItem('ts_streak', String(ns));
    if (right) setScore((s) => s + 1);

    setFb({ right, clue: card.clue, scam: card.scam, category: card.category });
    animate(x, saysScam ? -500 : 500, { duration: 0.28 }).then(() => {
      busy.current = false;
    });
  };

  const next = () => {
    setFb(null);
    x.set(0);
    setI((n) => n + 1);
  };

  const done = i >= 5 || i >= DECK.length;

  return (
    <div className="mx-auto max-w-md space-y-6">
      {/* Title & Streak Counter */}
      <div className="text-center">
        <TextReveal text="Daily Streak & Simulator" className="grad-text text-4xl font-extrabold" />
        <p className="mt-1 text-xs text-muted sm:text-sm">
          Swipe-to-Survive: Test your scam detection instincts. 5 daily simulated messages.
        </p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 shadow-md">
          <Flame className="text-amber-400 animate-pulse" size={22} />
          <span className="text-base font-black text-amber-300">
            {streak} Day Streak
          </span>
          <span className="text-xs text-amber-200/80">🔥 +100 XP</span>
        </div>
      </div>

      {done ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8 text-center space-y-4 shadow-2xl border-2 border-accent/40"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/20 text-accent mx-auto">
            <Award size={36} />
          </div>
          <h2 className="text-2xl font-black">Daily Challenge Completed!</h2>
          <p className="text-lg text-muted">
            You accurately identified <strong className="text-fg">{score} of 5</strong> threat scenarios.
          </p>

          <div className="rounded-xl border border-fg/10 bg-fg/5 p-4 text-xs text-muted">
            <p className="font-semibold text-accent">Habit-Forming Micro-Learning:</p>
            <p className="mt-1">
              Playing daily builds subconscious pattern recognition against social engineering and fraud links.
            </p>
          </div>

          <button
            className="btn-primary w-full !py-2.5 font-bold shadow-lg"
            onClick={() => {
              setI(0);
              setScore(0);
              x.set(0);
              setFb(null);
            }}
          >
            <RotateCcw size={16} />
            <span>Play Next Round</span>
          </button>
        </motion.div>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-muted px-2">
            <span>Card {i + 1} of 5</span>
            <span className="font-semibold">Swipe LEFT: Scam | Swipe RIGHT: Safe</span>
          </div>

          {/* Tinder-style Swipeable Card */}
          <div className="relative h-72">
            <motion.div
              key={i}
              drag={fb ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              style={{ x, rotate: rot }}
              onDragEnd={(_, info) => {
                if (info.offset.x > 90) answer(false);
                else if (info.offset.x < -90) answer(true);
              }}
              className="card absolute inset-0 flex cursor-grab flex-col justify-between p-6 text-lg font-medium shadow-2xl active:cursor-grabbing border-2 border-fg/30 bg-gradient-to-b from-bg to-bg/95"
              aria-label={`Message ${i + 1}`}
            >
              <div className="flex justify-between items-center text-xs text-muted">
                <span className="font-mono">Scenario #{i + 1}</span>
                <span className="text-[10px] tracking-wider uppercase font-bold text-accent">TrueSafe Sim</span>
              </div>

              {/* Visual Swipe Tags */}
              <motion.span
                style={{ opacity: safeOp }}
                className="absolute right-5 top-5 rounded-xl border-4 border-emerald-400 bg-emerald-950/80 px-4 py-1 text-xl font-black text-emerald-400 rotate-12"
              >
                SAFE ✓
              </motion.span>
              <motion.span
                style={{ opacity: scamOp }}
                className="absolute left-5 top-5 rounded-xl border-4 border-rose-500 bg-rose-950/80 px-4 py-1 text-xl font-black text-rose-400 -rotate-12"
              >
                SCAM ✗
              </motion.span>

              <p className="my-auto text-base sm:text-lg font-medium leading-relaxed text-fg">
                "{DECK[i].t}"
              </p>

              <div className="text-center text-[11px] text-muted font-mono">
                ← Swipe Left (Scam) | Swipe Right (Safe) →
              </div>
            </motion.div>
          </div>

          {/* Micro-Learning Feedback Sheet */}
          {fb ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`card space-y-3 p-5 shadow-xl border-2 ${
                fb.right ? 'border-emerald-500 bg-emerald-950/20' : 'border-rose-500 bg-rose-950/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {fb.right ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-xs">✓</span>
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white font-bold text-xs">✕</span>
                  )}
                  <h3 className="text-base font-extrabold text-fg">
                    {fb.right ? 'Spot On!' : 'Careful!'} It is {fb.scam ? 'a SCAM' : 'SAFE'}.
                  </h3>
                </div>
                <span className="rounded-md bg-fg/10 px-2 py-0.5 text-[10px] font-mono text-muted">
                  {fb.category}
                </span>
              </div>

              <div className="rounded-xl border border-fg/15 bg-bg/80 p-3 text-xs leading-relaxed text-fg">
                <strong className="block text-accent font-bold mb-1">Giveaway Clue:</strong>
                {fb.clue}
              </div>

              <button
                className="btn-primary w-full !py-2 !text-xs font-bold"
                onClick={next}
                autoFocus
              >
                <span>Next Scenario</span>
                <ChevronRight size={16} />
              </button>
            </motion.div>
          ) : (
            <div className="flex gap-3 pt-2">
              <button
                className="btn-ghost flex-1 !py-3 !text-rose-400 border-rose-500/30 hover:bg-rose-500/10 font-bold"
                onClick={() => answer(true)}
              >
                <X size={18} />
                <span>Mark Scam</span>
              </button>
              <button
                className="btn-primary flex-1 !py-3 !bg-emerald-600 hover:!bg-emerald-500 text-white font-bold"
                onClick={() => answer(false)}
              >
                <Check size={18} />
                <span>Mark Safe</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
