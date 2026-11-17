import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Phone, Copy, Users, ShieldCheck, AlertTriangle, Building,
  History, Trash2, ArrowUpRight, Sparkles, FileText, Check
} from 'lucide-react';
import { api } from '../lib/api.js';
import { useTheme } from '../lib/theme.jsx';
import { addHistory, getHistory, clearHistory } from '../lib/history.js';
import VanishInput from '../components/VanishInput.jsx';
import Avatar3D from '../components/Avatar3D.jsx';
import TextReveal from '../components/TextReveal.jsx';
import { useNavigate } from 'react-router-dom';
import { INDIAN_LANGUAGES } from '../lib/languages.js';

const PRIMARY_LANGS = ['en', 'ta', 'hi', 'te', 'kn', 'ml', 'bn', 'mr', 'gu', 'pa', 'or', 'ur'];

const QUICK_TESTS = [
  { label: '🔥 TNEB Power Cut SMS', text: 'Dear consumer, your electricity power will be disconnected tonight at 9:30 PM by TNEB officer. Immediately call 9876543210 and pay via bill-update.apk' },
  { label: '🏛️ Broken Panchayat Water Pipe', text: 'The panchayat drinking water pipe on South Mada street broke 3 days ago and clean water is leaking into the open drainage, no one is repairing it.' },
  { label: '🚨 CBI Digital Arrest Call', text: 'This is CBI New Delhi. A customs parcel sent to Cambodia with narcotics was caught in your name. You are under digital arrest on video call.' },
  { label: '🏛️ School Road Potholes', text: 'The main road connecting our village to the primary school has large 2-foot dangerous potholes causing accidents for two weeks.' },
  { label: '✅ Swiggy Order OTP', text: 'Your OTP for Swiggy order #91820 is 492102. Never share this OTP with anyone, including delivery partners.' },
];

export default function Scan() {
  const { setState } = useTheme();
  const nav = useNavigate();
  const [lang, setLang] = useState('en');
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState('');
  const [draft, setDraft] = useState(false);
  const [copied, setCopied] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setHistoryList(getHistory() || []);
    return () => setState('neutral');
  }, [setState]);

  const mood = busy
    ? 'scanning'
    : res?.classification === 'SCAM'
      ? 'angry'
      : res?.classification === 'CIVIC_ISSUE'
        ? 'scanning'
        : res?.classification === 'SAFE'
          ? 'happy'
          : 'calm';

  const run = async (text) => {
    setBusy(true);
    setErr('');
    setRes(null);
    setDraft(false);
    try {
      const r = await api.analyze(text, lang);
      setRes(r);
      setState(r.classification === 'SCAM' ? 'scam' : r.classification === 'CIVIC_ISSUE' ? 'civic' : 'safe');
      addHistory({ classification: r.classification, text: r.redactedText?.slice(0, 120), date: new Date().toLocaleTimeString() });
      setHistoryList(getHistory() || []);

      if (r.classification === 'CIVIC_ISSUE') {
        const kitObj = {
          id: `kit_${Date.now()}`,
          timestamp: new Date().toISOString(),
          caller: 'Web Scanner User',
          callerPhone: '+91 98401 [REDACTED]',
          device: 'TrueSafe AI Web Scanner',
          location: 'Town Panchayat, Tamil Nadu',
          department: r.department || 'Town Panchayat Administration',
          voiceTranscript: text,
          voiceTranscriptEnglish: text,
          summary: text.slice(0, 140),
          status: 'Draft Ready',
          photoUrl: null,
          photoAttached: false,
          grievanceLetter: r.grievanceLetter,
          grievanceLetterTamil: r.grievanceLetterTamil || r.grievanceLetter,
          cmHelplineText: r.cmHelplineText || `[CM HELPLINE]\nIssue: ${text}\nAction Requested: Immediate site inspection within 48h.`,
        };
        localStorage.setItem('ts_report', JSON.stringify(kitObj));
        window.dispatchEvent(new Event('ts_kit_updated'));
      }
    } catch (e) {
      setErr(e.status === 401 ? 'Session expired. Please sign in again.' : 'Analysis failed. Please try again.');
      setState('neutral');
    } finally {
      setBusy(false);
    }
  };

  const copy = async (t) => {
    await navigator.clipboard?.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistoryList([]);
  };

  return (
    <div className="space-y-6">
      {/* Title & Language Selector */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-bold text-accent mb-2">
          <Sparkles size={14} />
          <span>Gemini 3.8 / 2.0 Smart Intent Router</span>
        </div>
        <TextReveal text="Unified AI Scanner" className="grad-text text-center text-4xl font-extrabold sm:text-5xl" />
        <p className="mt-2 text-sm text-muted sm:text-base">
          Paste any suspicious message OR describe a local civic complaint. Gemini routes it instantly.
        </p>
      </div>

      <Avatar3D mood={mood} size={200} />

      {/* 23 Indian Languages Selector (8th Schedule of India) */}
      <div className="space-y-2">
        <div role="radiogroup" aria-label="Response language" className="flex flex-wrap justify-center gap-1.5 max-w-2xl mx-auto">
          {PRIMARY_LANGS.map((k) => {
            const item = INDIAN_LANGUAGES.find((l) => l.code === k);
            return (
              <button
                key={k}
                role="radio"
                aria-checked={lang === k}
                onClick={() => setLang(k)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  lang === k
                    ? 'bg-accent text-onaccent shadow-md font-bold'
                    : 'border border-fg/20 bg-fg/5 text-muted hover:border-fg/40 hover:text-fg'
                }`}
              >
                {item?.native || k}
              </button>
            );
          })}
        </div>
        <div className="flex justify-center items-center gap-2 text-xs text-muted">
          <span>More of 23 Languages:</span>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="rounded-lg border border-fg/25 bg-bg px-2 py-0.5 text-xs text-fg"
          >
            {INDIAN_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.native} ({l.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Unified Input Box (Vanish Particle Input with Web Speech Mic) */}
      <VanishInput onSubmit={run} lang={lang} busy={busy} />

      {/* 1-Click Quick Scenario Pills for Hackathon Judges */}
      <div className="text-center">
        <p className="text-xs font-semibold text-muted mb-2">Quick test scenarios for judges:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {QUICK_TESTS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => run(q.text)}
              disabled={busy}
              className="rounded-full border border-fg/20 bg-fg/5 px-3 py-1 text-xs font-medium text-muted transition hover:border-accent hover:text-fg active:scale-95"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Busy / Error States */}
      <div aria-live="polite">
        {busy && (
          <p className="flex items-center justify-center gap-2 text-center text-lg font-bold text-accent animate-pulse" role="status">
            <Sparkles size={20} className="animate-spin" />
            <span>Analyzing message via Google Gemini...</span>
          </p>
        )}
        {err && <p role="alert" className="text-center font-bold text-rose-500">{err}</p>}
      </div>

      {/* Analysis Result Display */}
      <AnimatePresence>
        {res && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card space-y-5 p-6 shadow-2xl border-2 ${
              res.classification === 'SCAM'
                ? 'border-rose-500 bg-rose-950/20'
                : res.classification === 'CIVIC_ISSUE'
                  ? 'border-blue-500 bg-blue-950/20'
                  : 'border-emerald-500 bg-emerald-950/20'
            }`}
            aria-label="Analysis result"
          >
            {/* Header Badge Strip */}
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-4 py-1.5 text-sm font-black uppercase tracking-wider text-white ${
                  res.classification === 'SCAM'
                    ? 'bg-rose-600'
                    : res.classification === 'CIVIC_ISSUE'
                      ? 'bg-blue-600'
                      : 'bg-emerald-600'
                }`}
              >
                {res.classification === 'CIVIC_ISSUE' ? '🏛️ CIVIC GRIEVANCE (URIMAI)' : res.classification === 'SCAM' ? '🚨 SCAM THREAT (KAVACH)' : '🛡️ SAFE'}
              </span>

              <span className="font-mono text-sm font-bold">
                Risk Score: {res.riskScore}/100
              </span>

              {res.engine && (
                <span className="ml-auto rounded-md bg-fg/10 px-2.5 py-1 text-xs font-mono text-muted">
                  Engine: {res.engine}
                </span>
              )}
            </div>

            {/* SCAM DETAILS */}
            {res.classification === 'SCAM' && (
              <div className="space-y-3">
                <h2 className="text-2xl font-extrabold text-rose-400">{res.scamType}</h2>
                <div className="rounded-xl bg-black/30 p-3 text-sm">
                  <p><strong>Psychological Vector:</strong> {res.tactic}</p>
                </div>
                <p className="text-base text-fg leading-relaxed">{res.explanation}</p>
                <p className="font-bold text-rose-300">💡 {res.advice}</p>

                {/* 1930 Cybercrime Draft Section */}
                <div className="mt-4 pt-4 border-t border-rose-500/30">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      className="btn-primary !bg-rose-600 hover:!bg-rose-500 text-white font-bold text-xs"
                      onClick={() => setDraft(!draft)}
                      aria-expanded={draft}
                    >
                      <Phone size={16} />
                      <span>{draft ? 'Hide 1930 Report Draft' : 'Draft 1930 Cybercrime Report'}</span>
                    </button>
                    <a href="tel:1930" className="btn-ghost !text-xs font-bold text-rose-400 border-rose-500/40">
                      Call 1930 Helpline
                    </a>
                  </div>

                  {draft && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 rounded-2xl border border-rose-500/40 bg-black/40 p-4"
                    >
                      <pre className="max-h-60 overflow-y-auto whitespace-pre-wrap font-sans text-xs text-rose-100">
                        {res.cybercrimeDraft}
                      </pre>
                      <div className="mt-3 flex gap-3">
                        <button className="btn-ghost !py-1.5 !text-xs" onClick={() => copy(res.cybercrimeDraft)}>
                          {copied ? <Check size={16} /> : <Copy size={16} />}
                          <span>{copied ? 'Copied' : 'Copy Draft'}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* CIVIC DETAILS */}
            {res.classification === 'CIVIC_ISSUE' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-blue-400">Urimai Grievance Letter Generated</h2>
                  <p className="text-xs text-muted font-semibold mt-1">
                    Department: {res.department || 'Town Panchayat Administration'}
                  </p>
                </div>

                <p className="text-base leading-relaxed">{res.explanation}</p>

                <div className="rounded-2xl border border-blue-500/30 bg-black/40 p-4">
                  <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap font-sans text-xs text-blue-100 leading-relaxed">
                    {res.grievanceLetter}
                  </pre>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button className="btn-ghost !py-2 !text-xs font-semibold" onClick={() => copy(res.grievanceLetter)}>
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copied ? 'Copied' : 'Copy Formal Letter'}</span>
                  </button>

                  <button
                    className="btn-primary !py-2 !text-xs font-bold"
                    onClick={() => nav('/family')}
                  >
                    <Users size={16} />
                    <span>Open in Family Hub (Urimai Action Kit)</span>
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* SAFE DETAILS */}
            {res.classification === 'SAFE' && (
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-xl font-bold text-emerald-400">
                  <ShieldCheck size={26} />
                  <span>Looks Safe. No Known Malicious Indicators Found.</span>
                </p>
                <p className="text-base text-muted">{res.explanation}</p>
                <p className="text-sm font-semibold">{res.advice}</p>
              </div>
            )}

            {/* Redacted Data Accordion */}
            <details className="mt-3 text-xs text-muted border-t border-fg/10 pt-3">
              <summary className="cursor-pointer font-bold hover:text-fg">
                Privacy Audit: Redacted Text (Gemini Privacy Filter)
              </summary>
              <p className="mt-2 rounded-lg bg-fg/5 p-3 font-mono break-words">
                {res.redactedText}
              </p>
            </details>
          </motion.section>
        )}
      </AnimatePresence>

      {/* SCAN HISTORY DRAWER */}
      <div className="rounded-2xl border border-fg/15 bg-fg/5 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted hover:text-fg"
          >
            <History size={16} />
            <span>Scan History ({historyList.length})</span>
          </button>
          {historyList.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-[11px] text-muted hover:text-rose-400 flex items-center gap-1"
            >
              <Trash2 size={13} />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {showHistory && (
          <div className="mt-3 space-y-2">
            {historyList.length === 0 ? (
              <p className="text-xs text-muted italic">No past scans recorded yet.</p>
            ) : (
              historyList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-fg/10 bg-bg p-3 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        item.classification === 'SCAM'
                          ? 'bg-rose-500'
                          : item.classification === 'CIVIC_ISSUE'
                            ? 'bg-blue-500'
                            : 'bg-emerald-500'
                      }`}
                    />
                    <span className="font-bold">{item.classification}</span>
                    <span className="text-muted line-clamp-1 max-w-[200px] sm:max-w-md">"{item.text}"</span>
                  </div>
                  <span className="text-[10px] text-muted">{item.date || ''}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
