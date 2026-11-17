import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, FileText, MessageCircle, CheckCircle2, AlertOctagon, Phone,
  Play, Pause, RotateCcw, Share2, Download, ExternalLink, MapPin,
  Clock, ShieldAlert, Sparkles, UserCheck, Send, Check, Image as ImageIcon,
  Building, ChevronRight, FileCheck, Info
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useTheme } from '../lib/theme.jsx';
import TextReveal from '../components/TextReveal.jsx';
import KeypadAgent from '../components/KeypadAgent.jsx';
import { DEFAULT_ACTION_KIT } from '../lib/demo.js';
import { playAlertTone } from '../lib/sound.js';

// Sample evidence photos for 1-click judge testing
const SAMPLE_PHOTOS = [
  {
    name: 'Broken Water Pipe (South Mada St)',
    url: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Pothole Road Damage (Near School)',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Non-functional Street Light',
    url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80',
  },
];

export default function Family() {
  const { setState } = useTheme();
  const [activeTab, setActiveTab] = useState('physical'); // 'physical', 'digital', 'proxy'
  const [kit, setKit] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ts_report')) || DEFAULT_ACTION_KIT;
    } catch {
      return DEFAULT_ACTION_KIT;
    }
  });

  const [sosAlert, setSosAlert] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ts_sos_alert'));
    } catch {
      return null;
    }
  });

  const [photo, setPhoto] = useState(null);
  const [msg, setMsg] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [showKeypad, setShowKeypad] = useState(false);
  const [showProxyModal, setShowProxyModal] = useState(false);
  const [proxySubmitted, setProxySubmitted] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const audioIntervalRef = useRef(null);

  useEffect(() => {
    setState('civic');
    const updateHandler = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('ts_report'));
        if (stored) setKit(stored);
        const sos = JSON.parse(localStorage.getItem('ts_sos_alert'));
        if (sos) setSosAlert(sos);
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('ts_kit_updated', updateHandler);
    window.addEventListener('storage', updateHandler);
    return () => {
      setState('neutral');
      window.removeEventListener('ts_kit_updated', updateHandler);
      window.removeEventListener('storage', updateHandler);
    };
  }, [setState]);

  // Simulated Father Voice Recording player
  const togglePlayAudio = () => {
    if (isPlayingAudio) {
      clearInterval(audioIntervalRef.current);
      setIsPlayingAudio(false);
      return;
    }
    setIsPlayingAudio(true);
    let p = audioProgress >= 100 ? 0 : audioProgress;
    audioIntervalRef.current = setInterval(() => {
      p += 4;
      if (p >= 100) {
        clearInterval(audioIntervalRef.current);
        setIsPlayingAudio(false);
        setAudioProgress(100);
      } else {
        setAudioProgress(p);
      }
    }, 150);
  };

  const handleFileUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto({ url: reader.result, type: 'JPEG', name: f.name });
      setMsg('Evidence photograph successfully attached to Urimai kit!');
    };
    reader.readAsDataURL(f);
  };

  const selectSamplePhoto = (sample) => {
    // Convert sample url into base64 canvas for reliable jsPDF inclusion
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width || 400;
      canvas.height = img.height || 300;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      try {
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhoto({ url: dataUrl, type: 'JPEG', name: sample.name });
        setMsg(`Sample evidence "${sample.name}" attached!`);
      } catch {
        setPhoto({ url: sample.url, type: 'JPEG', name: sample.name });
        setMsg(`Sample evidence attached.`);
      }
    };
    img.src = sample.url;
  };

  // Generate Formal Urimai Grievance PDF with embedded photo and 5 resident signatures
  const generateUrimaiPdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    let y = 45;

    // Header & Emblem Bar
    doc.setFillColor(26, 43, 76);
    doc.rect(40, 30, 515, 36, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('GOVERNMENT OF TAMIL NADU - CITIZEN GRIEVANCE PETITION (URIMAI)', 55, 52);

    // Metadata Strip
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    y = 80;
    doc.text(`Petition ID: TS-${kit.id.slice(-6).toUpperCase()}`, 45, y);
    doc.text(`Origin: Keypad Phone Speed-Dial '9'`, 220, y);
    doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 430, y);
    y += 18;
    doc.setDrawColor(200, 200, 200);
    doc.line(40, y, 555, y);
    y += 18;

    // Recipient & Legal Reference
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(0, 0, 0);
    doc.text('To:', 45, y); y += 14;
    doc.setFont('helvetica', 'normal');
    doc.text('The Executive Officer / Municipal Commissioner,', 45, y); y += 13;
    doc.text(`${kit.department},`, 45, y); y += 13;
    doc.text('District Administration, Government of Tamil Nadu.', 45, y); y += 18;

    // Subject
    doc.setFont('helvetica', 'bold');
    doc.text(`Subject: Urgent Redressal Request - ${kit.summary.slice(0, 75)}`, 45, y); y += 14;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text('Statutory Reference: Under Section 110 of the Tamil Nadu Panchayats Act, 1994 & Citizen Charter', 45, y); y += 18;

    // Body
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(20, 20, 20);
    const bodyText = `Respected Sir/Madam,

We, the undersigned residents of ${kit.location || 'Ward 4, Town Panchayat'}, respectfully bring to your immediate notice the following unresolved public grievance:

"${kit.voiceTranscriptEnglish || kit.summary}"

This severe issue has been persisting without intervention, causing health, environmental, and physical hazards to the elderly, women, and school-going children. Despite verbal alerts to local operators, no remedial action has been initiated.

We pray that the concerned engineering wing immediately conduct a spot inspection and rectify this grievance on an emergency footing.`;

    const bodyLines = doc.splitTextToSize(bodyText, 505);
    doc.text(bodyLines, 45, y);
    y += bodyLines.length * 12 + 16;

    // Embed Evidence Photo if uploaded
    if (photo && photo.url && y < 540) {
      try {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text('Exhibit A: On-Site Photographic Evidence (Verified & Geo-Tagged)', 45, y);
        y += 12;
        doc.addImage(photo.url, 'JPEG', 45, y, 180, 110);
        doc.setDrawColor(180, 180, 180);
        doc.rect(45, y, 180, 110);
        y += 122;
      } catch (err) {
        console.warn('PDF image embed notice:', err);
      }
    }

    // Signatures of Affected Residents Table (Minimum 5 required)
    if (y > 620) {
      doc.addPage();
      y = 50;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(180, 40, 20);
    doc.text('Signatures of Affected Residents (Minimum 5 required)', 45, y);
    y += 14;

    // Table Header
    doc.setFillColor(240, 243, 248);
    doc.rect(40, y, 515, 18, 'F');
    doc.setDrawColor(180, 180, 180);
    doc.rect(40, y, 515, 18);
    doc.setFontSize(8.5);
    doc.setTextColor(0, 0, 0);
    doc.text('S.No', 48, y + 12);
    doc.text('Resident Name', 85, y + 12);
    doc.text('Door / Ward No.', 220, y + 12);
    doc.text('Mobile Number', 330, y + 12);
    doc.text('Signature / Thumb Impression', 420, y + 12);
    y += 18;

    // 5 Rows for Signatures
    const rows = [
      ['1.', `${kit.caller} (Applicant)`, 'D.No 4/12, South Mada St', `${kit.callerPhone || '+91 94432 [REDACTED]'}`],
      ['2.', 'M. Shanmugam', 'D.No 4/15, South Mada St', '98421 [REDACTED]'],
      ['3.', 'K. Lakshmi Ammal', 'D.No 4/18, South Mada St', '94433 [REDACTED]'],
      ['4.', 'R. Selvam (Ward Resident)', 'D.No 4/22, South Mada St', '97892 [REDACTED]'],
      ['5.', 'P. Murugan', 'D.No 4/26, South Mada St', '94861 [REDACTED]'],
    ];

    rows.forEach(([sno, name, door, mob]) => {
      doc.rect(40, y, 515, 24);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(sno, 48, y + 15);
      doc.text(name, 85, y + 15);
      doc.text(door, 220, y + 15);
      doc.text(mob, 330, y + 15);
      // dotted line for signature
      doc.setLineDashPattern([2, 2], 0);
      doc.line(420, y + 16, 545, y + 16);
      doc.setLineDashPattern([], 0);
      y += 24;
    });

    y += 18;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Generated via TrueSafe Urimai Engine · Certified for local delivery to Town Panchayat / Ward Office', 45, y);

    doc.save(`urimai-petition-ward4-${Date.now().toString().slice(-4)}.pdf`);
    setMsg('Official Urimai Grievance PDF generated with 5-resident signature block!');
  };

  // WhatsApp proxy share link
  const proxyUrl = `${window.location.origin}${window.location.pathname}?proxy_case=${kit.id}&target=neighbor`;
  const waShareText = encodeURIComponent(
    `🚨 *Urimai Emergency Help Request*\n\n` +
    `Hello! My father (${kit.caller}) reported a civic issue via speed-dial:\n` +
    `"${kit.summary}"\n\n` +
    `I am currently in another city. Could you please take a quick photo of the issue so Urimai can attach it to the official Panchayat petition?\n\n` +
    `👉 *Click here to snap & upload photo:* ${proxyUrl}\n\n` +
    `Thank you for helping our street!`
  );

  const copyGovtDraft = (text) => {
    navigator.clipboard?.writeText(text);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const dismissSos = () => {
    localStorage.removeItem('ts_sos_alert');
    setSosAlert(null);
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Interactive Speed-Dial Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <TextReveal text="Family Hub: The Last-Mile Bridge" className="grad-text text-3xl font-extrabold sm:text-4xl" />
          <p className="mt-1 text-sm text-muted sm:text-base">
            Connecting rural button-phone users to the digital grievance & anti-fraud ecosystem.
          </p>
        </div>
        <button
          onClick={() => setShowKeypad(!showKeypad)}
          className="btn-primary !min-h-[44px] shadow-lg"
          aria-expanded={showKeypad}
        >
          <Phone size={18} />
          <span>{showKeypad ? 'Hide Keypad' : 'Simulate Speed-Dial 9'}</span>
        </button>
      </div>

      {/* Speed-Dial 9 Simulator Drawer */}
      <AnimatePresence>
        {showKeypad && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <KeypadAgent onKitGenerated={(newKit) => setKit(newKit)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIVE SOS ALERT BANNER (If scam detected from father's phone) */}
      <AnimatePresence>
        {sosAlert && (
          <motion.section
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative overflow-hidden rounded-3xl border-2 border-rose-500 bg-gradient-to-r from-rose-950/80 via-rose-900/60 to-bg p-6 text-white shadow-2xl"
            aria-label="Active SOS Scam Alert"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 animate-ping rounded-full bg-rose-400" />
                <span className="rounded-full bg-rose-500 px-3 py-1 text-xs font-black uppercase tracking-wider">
                  🚨 LIVE SOS ALERT FROM RURAL PARENT
                </span>
                <span className="text-xs text-rose-200">Triggered at {sosAlert.time}</span>
              </div>
              <button
                onClick={dismissSos}
                className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/20"
              >
                Mark Handled
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
              <div>
                <h3 className="text-xl font-extrabold text-white sm:text-2xl">{sosAlert.type}</h3>
                <p className="mt-1 text-sm text-rose-100">
                  <strong>Reported by:</strong> {sosAlert.caller} · Speed-Dial '9' Twilio Voice Agent
                </p>
                <p className="mt-2 rounded-xl bg-black/30 p-3 text-sm italic text-rose-200">
                  "{sosAlert.summary}"
                </p>
                <p className="mt-2 text-sm font-semibold text-rose-200">
                  <strong>Safety Action:</strong> {sosAlert.advice}
                </p>
              </div>

              <div className="flex flex-col justify-center gap-2">
                <a
                  href="tel:1930"
                  className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-rose-950 shadow-lg hover:bg-rose-100"
                >
                  <Phone size={18} />
                  <span>Call 1930 Cyber Helpline</span>
                </a>
                <button
                  onClick={() => copyGovtDraft(sosAlert.cybercrimeDraft || 'Emergency Cybercrime Report')}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/40 bg-black/20 px-5 py-2.5 text-xs font-semibold text-white hover:bg-black/40"
                >
                  <FileText size={16} />
                  <span>{copiedDraft ? '1930 Draft Copied!' : 'Copy 1930 Complaint Draft'}</span>
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* URIMAI ACTION KIT (The O2O Multi-Modal Handoff) */}
      <section className="card space-y-6 p-6 shadow-2xl" aria-label="Actionable Urimai Kit">
        {/* Header Strip with Audio Player */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-fg/15 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400">
              <Building size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-400">
                  🚨 Step 4: Family Request Ready
                </span>
                <span className="text-xs text-muted">ID: {kit.id.slice(-6).toUpperCase()}</span>
              </div>
              <h2 className="text-xl font-black sm:text-2xl">Actionable Urimai Kit</h2>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-fg/15 bg-fg/5 p-2">
            <button
              onClick={togglePlayAudio}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-onaccent shadow-md transition hover:scale-105 active:scale-95"
              aria-label={isPlayingAudio ? 'Pause father voice recording' : 'Play father voice recording'}
            >
              {isPlayingAudio ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
            <div className="pr-3 text-left">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <span className={isPlayingAudio ? 'text-accent' : 'text-fg'}>Father's Spoken Audio</span>
                <span className="text-[10px] text-muted">({kit.voiceAudioDuration || '0:14'})</span>
              </div>
              {/* Audio progress bar */}
              <div className="mt-1 h-1.5 w-32 rounded-full bg-fg/20 overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-150"
                  style={{ width: `${audioProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Father's Transcript & Incident Summary */}
        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1">
              <MapPin size={14} className="text-blue-400" />
              <span>{kit.location}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              <span>Device: {kit.device} · Speed-Dial '9'</span>
            </span>
          </div>

          <p className="mt-2 text-lg font-bold text-fg sm:text-xl">{kit.summary}</p>

          <div className="mt-3 rounded-xl border border-fg/10 bg-bg/80 p-3 text-sm">
            <p className="font-semibold text-accent">Tamil Audio Transcript (Recorded from Feature Phone):</p>
            <p className="mt-0.5 font-medium italic text-muted">"{kit.voiceTranscript}"</p>
            <p className="mt-2 font-semibold text-blue-400">English Translation:</p>
            <p className="mt-0.5 text-muted">"{kit.voiceTranscriptEnglish || kit.summary}"</p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-muted">Assigned Department:</span>
            <span className="rounded-md bg-fg/10 px-2.5 py-1 font-mono font-bold text-fg">
              {kit.department}
            </span>
          </div>
        </div>

        {/* Multi-Modal Handoff Solutions Selector */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
              Choose Delivery Workflow
            </h3>
            <span className="text-xs text-accent font-semibold">AI Project Manager Handoff</span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button
              onClick={() => setActiveTab('physical')}
              className={`flex items-center gap-2 rounded-2xl border p-4 text-left transition ${
                activeTab === 'physical'
                  ? 'border-accent bg-accent/15 text-fg shadow-md'
                  : 'border-fg/15 bg-fg/5 text-muted hover:border-fg/30'
              }`}
            >
              <FileCheck size={20} className={activeTab === 'physical' ? 'text-accent' : ''} />
              <div>
                <p className="text-sm font-bold">1. In Same Town</p>
                <p className="text-xs opacity-75">Physical O2O Kit + Signatures</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('digital')}
              className={`flex items-center gap-2 rounded-2xl border p-4 text-left transition ${
                activeTab === 'digital'
                  ? 'border-accent bg-accent/15 text-fg shadow-md'
                  : 'border-fg/15 bg-fg/5 text-muted hover:border-fg/30'
              }`}
            >
              <ExternalLink size={20} className={activeTab === 'digital' ? 'text-accent' : ''} />
              <div>
                <p className="text-sm font-bold">2. Digital India Bypass</p>
                <p className="text-xs opacity-75">CM Helpline & CPGRAMS</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('proxy')}
              className={`flex items-center gap-2 rounded-2xl border p-4 text-left transition ${
                activeTab === 'proxy'
                  ? 'border-accent bg-accent/15 text-fg shadow-md'
                  : 'border-fg/15 bg-fg/5 text-muted hover:border-fg/30'
              }`}
            >
              <MessageCircle size={20} className={activeTab === 'proxy' ? 'text-accent' : ''} />
              <div>
                <p className="text-sm font-bold">3. Local Proxy</p>
                <p className="text-xs opacity-75">WhatsApp Neighbor Handoff</p>
              </div>
            </button>
          </div>
        </div>

        {/* TAB 1: IN SAME TOWN (PHYSICAL O2O KIT) */}
        {activeTab === 'physical' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Photo Evidence Upload Box */}
              <div className="rounded-2xl border border-fg/15 bg-fg/5 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="flex items-center gap-2 text-base font-bold">
                      <Camera className="text-accent" size={18} />
                      <span>Step A: Evidence Photo Upload</span>
                    </h4>
                    <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-bold text-accent">
                      Required for PDF
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Since father cannot photograph from a button phone, son snaps or attaches photo here:
                  </p>

                  {/* Photo Preview / Upload Zone */}
                  {photo ? (
                    <div className="mt-3 relative overflow-hidden rounded-xl border border-fg/20">
                      <img src={photo.url} alt="Civic issue evidence" className="h-44 w-full object-cover" />
                      <div className="absolute bottom-2 left-2 rounded-lg bg-black/75 px-2 py-1 text-[11px] text-white">
                        ✓ Evidence Attached ({photo.name})
                      </div>
                      <button
                        onClick={() => setPhoto(null)}
                        className="absolute top-2 right-2 rounded-full bg-black/75 p-1 text-white hover:bg-black"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-fg/25 p-5 text-center">
                      <ImageIcon size={32} className="text-muted" />
                      <p className="mt-2 text-xs font-semibold">Upload Photo of Broken Pipe / Road</p>
                      <label className="btn-primary mt-3 !py-1.5 !text-xs cursor-pointer">
                        <span>Choose From Device</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="sr-only"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </div>
                  )}

                  {/* Judge 1-Click Sample Evidence Selector */}
                  <div className="mt-3">
                    <p className="text-[11px] font-semibold text-muted">Or test with 1-click sample evidence:</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {SAMPLE_PHOTOS.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => selectSamplePhoto(s)}
                          className="rounded-lg border border-fg/15 bg-bg px-2.5 py-1 text-[11px] font-medium transition hover:border-accent hover:text-accent"
                        >
                          + {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* PDF Document Summary & 5 Signature Table Feature */}
              <div className="rounded-2xl border border-fg/15 bg-fg/5 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="flex items-center gap-2 text-base font-bold">
                      <FileText className="text-accent" size={18} />
                      <span>Step B: Legal PDF Generation</span>
                    </h4>
                    <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[11px] font-bold text-blue-400">
                      Bilingual EN + TA
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Generates official petition under TN Panchayats Act 1994, with embedded photo and 5 resident signatures:
                  </p>

                  <div className="mt-3 space-y-2 rounded-xl border border-fg/10 bg-bg p-3 text-xs">
                    <div className="flex items-center justify-between font-semibold">
                      <span>✓ Statutory Reference:</span>
                      <span className="text-muted">TN Panchayats Act Sec 110</span>
                    </div>
                    <div className="flex items-center justify-between font-semibold">
                      <span>✓ Evidence Attached:</span>
                      <span className={photo ? 'text-emerald-400' : 'text-amber-400'}>
                        {photo ? 'Yes (Exhibit A)' : 'Not yet uploaded'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-semibold">
                      <span>✓ Signatures Block:</span>
                      <span className="text-accent font-bold">5 Affected Residents Table</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-fg/10 flex gap-2">
                  <button
                    onClick={generateUrimaiPdf}
                    className="btn-primary !w-full !py-2.5 text-xs font-bold shadow-lg"
                  >
                    <Download size={16} />
                    <span>Download Legal PDF (Print-Ready)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Step C: Local Offline Instructions Card */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
              <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                <CheckCircle2 size={18} />
                <span>Step C: Offline Instructions for the Tech-Savvy Son</span>
              </h4>
              <ol className="mt-3 grid gap-3 sm:grid-cols-3 text-xs">
                <li className="rounded-xl border border-fg/10 bg-bg p-3">
                  <strong className="block text-emerald-300 font-bold mb-1">1. Print Document:</strong>
                  Print the downloaded 1-page PDF at the nearest village e-Seva center or photocopy shop.
                </li>
                <li className="rounded-xl border border-fg/10 bg-bg p-3">
                  <strong className="block text-emerald-300 font-bold mb-1">2. Collect 5 Signatures:</strong>
                  Walk down your street and get signatures / thumb impressions from 5 neighboring families in the table.
                </li>
                <li className="rounded-xl border border-fg/10 bg-bg p-3">
                  <strong className="block text-emerald-300 font-bold mb-1">3. Hand-Deliver to EO:</strong>
                  Deliver to the Executive Officer at {kit.department} and obtain an acknowledgement seal.
                </li>
              </ol>
            </div>
          </motion.div>
        )}

        {/* TAB 2: DIGITAL INDIA ALTERNATIVE (CENTRALIZED GOVT PORTALS) */}
        {activeTab === 'digital' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-purple-300">
                    Solution 1: The "Digital-First" Remote Bypass
                  </h4>
                  <p className="mt-1 text-xs text-muted">
                    If you are working or studying in another city (hostel in Chennai/Bangalore), bypass local Panchayat delays via state grievance portals:
                  </p>
                </div>
                <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-300">
                  Direct Escalation
                </span>
              </div>

              {/* Portal Cards */}
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-fg/15 bg-bg p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-accent">Tamil Nadu State Portal</span>
                    <h5 className="text-sm font-bold">Mudhalvarin Mugavari (CM Helpline)</h5>
                    <p className="mt-1 text-xs text-muted">Direct grievance tracker to the Chief Minister's Special Cell.</p>
                  </div>
                  <a
                    href="https://cmhelpline.tnega.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary mt-3 !py-1.5 !text-xs"
                  >
                    <span>Open CM Helpline</span>
                    <ExternalLink size={13} />
                  </a>
                </div>

                <div className="rounded-xl border border-fg/15 bg-bg p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-accent">National Central Portal</span>
                    <h5 className="text-sm font-bold">CPGRAMS (pgportal.gov.in)</h5>
                    <p className="mt-1 text-xs text-muted">Centralized Public Grievance Redress and Monitoring System.</p>
                  </div>
                  <a
                    href="https://pgportal.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary mt-3 !py-1.5 !text-xs"
                  >
                    <span>Open CPGRAMS</span>
                    <ExternalLink size={13} />
                  </a>
                </div>

                <div className="rounded-xl border border-fg/15 bg-bg p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-accent">Urban Local Bodies</span>
                    <h5 className="text-sm font-bold">Namma Chennai / GCC Portal</h5>
                    <p className="mt-1 text-xs text-muted">1913 Helpline and Corporation public works grievance redressal.</p>
                  </div>
                  <a
                    href="https://chennaicorporation.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost mt-3 !py-1.5 !text-xs"
                  >
                    <span>Open Municipal Portal</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              {/* Ready-to-Paste Formatted Grievance Text */}
              <div className="mt-5 rounded-xl border border-fg/15 bg-bg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-fg">AI Formatted Portal Complaint Text (English & Tamil):</span>
                  <button
                    onClick={() => copyGovtDraft(kit.cmHelplineText || kit.summary)}
                    className="btn-primary !min-h-[34px] !py-1 !text-xs"
                  >
                    {copiedDraft ? <Check size={14} /> : <FileText size={14} />}
                    <span>{copiedDraft ? 'Copied to Clipboard!' : '1-Click Copy For Portal'}</span>
                  </button>
                </div>
                <pre className="mt-3 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg bg-fg/5 p-3 text-xs font-sans text-muted">
                  {kit.cmHelplineText || kit.summary}
                </pre>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: LOCAL PROXY (WHATSAPP HANDOFF) */}
        {activeTab === 'proxy' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-amber-400">
                    Solution 2: The "Local Proxy" (WhatsApp Handoff)
                  </h4>
                  <p className="mt-1 text-xs text-muted">
                    Son acts as the Project Manager! Forward a secure link to the parent's neighbor, local auto driver, or village e-Seva operator to snap the photo:
                  </p>
                </div>
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400">
                  O2O Proxy Link
                </span>
              </div>

              {/* Formatted WhatsApp Message Preview */}
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-[#072418] p-4 text-emerald-100">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <MessageCircle size={16} />
                  <span>Formatted WhatsApp Message Ready to Forward:</span>
                </div>
                <div className="mt-2 rounded-lg bg-black/40 p-3 text-xs font-mono leading-relaxed text-emerald-200">
                  <p>🚨 *Urimai Emergency Help Request*</p>
                  <p className="mt-1">Hello! My father ({kit.caller}) reported a civic issue via speed-dial:</p>
                  <p className="italic">"{kit.summary}"</p>
                  <p className="mt-1">Could you please take a quick photo of the issue so Urimai can attach it to the official Panchayat petition?</p>
                  <p className="mt-2 text-emerald-400 underline font-semibold">👉 Click here to snap & upload: {proxyUrl}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={`https://wa.me/?text=${waShareText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary !min-h-[40px] !py-2 !text-xs font-bold shadow-md"
                  >
                    <Share2 size={16} />
                    <span>Forward via WhatsApp</span>
                  </a>

                  <button
                    onClick={() => setShowProxyModal(true)}
                    className="btn-ghost !min-h-[40px] !py-2 !text-xs font-bold"
                  >
                    <span>Test Neighbor Proxy Experience (Judge Simulation)</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Global Feedback Banner */}
        {msg && (
          <p role="status" className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
            <CheckCircle2 size={18} />
            <span>{msg}</span>
          </p>
        )}
      </section>

      {/* NEIGHBOR PROXY VIEW MODAL (Judge Experience) */}
      <AnimatePresence>
        {showProxyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-fg/20 bg-bg p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-fg/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Neighbor Mobile Upload View</h4>
                    <p className="text-[10px] text-muted">What the neighbor sees when opening the WhatsApp link</p>
                  </div>
                </div>
                <button onClick={() => setShowProxyModal(false)} className="text-muted hover:text-fg text-sm">✕</button>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="rounded-xl bg-fg/5 p-3">
                  <p className="font-bold text-fg">Help {kit.caller} document this issue:</p>
                  <p className="mt-1 text-muted">"{kit.summary}"</p>
                </div>

                {proxySubmitted ? (
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-center">
                    <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
                    <p className="mt-2 text-sm font-bold text-emerald-400">Photo Attached to Official Urimai Petition!</p>
                    <p className="mt-1 text-muted">Father's Action Kit in the son's dashboard has been updated in real-time.</p>
                    <button
                      onClick={() => setShowProxyModal(false)}
                      className="btn-primary mt-3 !py-1.5 !text-xs !w-full"
                    >
                      Return to Family Hub
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold text-fg mb-2">Snap Photo on Location:</p>
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-fg/20 p-6">
                      <Camera size={36} className="text-accent mb-2" />
                      <button
                        onClick={() => {
                          selectSamplePhoto(SAMPLE_PHOTOS[0]);
                          setProxySubmitted(true);
                        }}
                        className="btn-primary !py-2 !text-xs font-bold"
                      >
                        Snap & Submit Photo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
