import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneCall, PhoneOff, Mic, MicOff, Volume2, Sparkles, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';
import { playDtmfTone, playRingingTone, playAlertTone, speakText } from '../lib/sound.js';
import { heuristic, redactPII, DEFAULT_ACTION_KIT } from '../lib/demo.js';
import { useNavigate } from 'react-router-dom';

const SCENARIOS = [
  {
    id: 'urimai_pipe',
    type: 'CIVIC',
    label: 'Scenario B (Urimai): Broken Water Pipe',
    tamil: 'வணக்கம், எங்க தெருவுல பஞ்சாயத்து குடிநீர் குழாய் உடைஞ்சு 3 நாளா தண்ணி வீணாகுது, யாரும் சரி பண்ணல.',
    english: 'Vanakkam, the panchayat drinking water pipe on our street broke 3 days ago and no one is fixing it.',
    spokenFather: 'வணக்கம், எங்க தெருவுல பஞ்சாயத்து குடிநீர் குழாய் உடைஞ்சு 3 நாளா தண்ணி வீணாகுது, யாரும் சரி பண்ணல.',
    aiResponseTamil: 'நான் புரிந்து கொண்டேன். உடைந்த குடிநீர் குழாய் குறித்து நகராட்சி குடிநீர் வாரியத்திற்கு புகார் மனு தயார் செய்து உங்கள் மகனின் போனுக்கு அனுப்பியுள்ளேன்.',
    aiResponseEnglish: 'I understand the water pipe is broken. I have drafted an official complaint to the Municipal Water Board and sent it to your son\'s phone to submit.',
  },
  {
    id: 'kavach_otp',
    type: 'SCAM',
    label: 'Scenario A (Kavach): Bank OTP Demand',
    tamil: 'வங்கியில இருந்து மேனேஜர் பேசுறதா சொல்லி என் அக்கவுண்ட் பிளாக் ஆகிடும்னு OTP கேட்டாங்க.',
    english: 'A man called claiming to be bank manager, said my account will be blocked and asked for my OTP.',
    spokenFather: 'வங்கியில இருந்து பேசுறதா சொல்லி என் அக்கவுண்ட் பிளாக் ஆகிடும்னு OTP கேட்டாங்க.',
    aiResponseTamil: 'எச்சரிக்கை! இது ஆபத்தான மோசடி. OTP எதையும் பகிராதீர்கள். உங்கள் மகனின் போனுக்கு உடனடி SOS எச்சரிக்கை அனுப்பியுள்ளேன், 1930 புகார் தயார்.',
    aiResponseEnglish: 'Warning! This is a dangerous scam. Do not share OTP. I have triggered an urgent SOS alert to your son\'s phone and prepared a 1930 report.',
  },
  {
    id: 'urimai_road',
    type: 'CIVIC',
    label: 'Scenario C (Urimai): School Road Potholes',
    tamil: 'ஊர்ல பள்ளிக்கு போற மெயின் ரோடு முழுக்க பெரிய பள்ளங்கள், குழந்தைகள் போக முடியாம விழுறாங்க.',
    english: 'The main village road leading to primary school is full of dangerous potholes, children are falling.',
    spokenFather: 'ஊர்ல பள்ளிக்கு போற மெயின் ரோடு முழுக்க பெரிய பள்ளங்கள், குழந்தைகள் போக முடியாம விழுறாங்க.',
    aiResponseTamil: 'சாலை சேதம் குறித்து நெடுஞ்சாலை மற்றும் ஊராட்சி துறைக்கு மனு தயார் செய்து உங்கள் குடும்ப டாஷ்போர்டுக்கு அனுப்பியுள்ளேன்.',
    aiResponseEnglish: 'I have drafted an official petition to the Panchayat Road Wing and sent it to your family dashboard.',
  },
];

export default function KeypadAgent({ onKitGenerated, compact = false }) {
  const nav = useNavigate();
  const [callState, setCallState] = useState('IDLE'); // IDLE, DIALING, CONNECTED, PROCESSING, FINISHED
  const [typedDigits, setTypedDigits] = useState('');
  const [activeLang, setActiveLang] = useState('ta'); // 'ta', 'en', 'hi'
  const [spokenSubtitle, setSpokenSubtitle] = useState('');
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [activeResult, setActiveResult] = useState(null);
  const [isMicListening, setIsMicListening] = useState(false);
  const [waveformBars, setWaveformBars] = useState([12, 24, 18, 30, 20, 10, 28, 16]);
  const recogRef = useRef(null);

  // Dynamic waveform animation when agent is speaking
  useEffect(() => {
    let t;
    if (agentSpeaking || callState === 'PROCESSING') {
      t = setInterval(() => {
        setWaveformBars([
          Math.floor(10 + Math.random() * 32),
          Math.floor(15 + Math.random() * 40),
          Math.floor(8 + Math.random() * 30),
          Math.floor(20 + Math.random() * 45),
          Math.floor(12 + Math.random() * 35),
          Math.floor(25 + Math.random() * 42),
          Math.floor(10 + Math.random() * 28),
          Math.floor(18 + Math.random() * 38),
        ]);
      }, 120);
    }
    return () => clearInterval(t);
  }, [agentSpeaking, callState]);

  // Handle keypad digit press
  const handleDigit = (digit) => {
    playDtmfTone(digit);
    setTypedDigits((prev) => (prev.length < 10 ? prev + digit : prev));
  };

  // Speed-dial '9' initiates the instant rural AI lifeline
  const startSpeedDial9 = () => {
    playDtmfTone('9', 250);
    setTypedDigits('9');
    initiateCall('9');
  };

  const initiateCall = (digits = typedDigits) => {
    if (!digits) return;
    setCallState('DIALING');
    playRingingTone();

    setTimeout(() => {
      setCallState('CONNECTED');
      const greeting = activeLang === 'ta'
        ? 'வணக்கம். என்ன நடந்தது என்று சொல்லுங்கள்.'
        : activeLang === 'hi'
          ? 'नमस्ते। बताइए क्या हुआ है?'
          : 'Vanakkam. Tell me what happened.';
      setSpokenSubtitle(greeting);
      setAgentSpeaking(true);
      speakText(greeting, activeLang, () => {
        setAgentSpeaking(false);
      });
    }, 1400);
  };

  const endCall = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (recogRef.current) recogRef.current.stop();
    setCallState('IDLE');
    setTypedDigits('');
    setSpokenSubtitle('');
    setAgentSpeaking(false);
    setIsMicListening(false);
  };

  // Process a chosen scenario
  const handleScenarioSelect = (scenario) => {
    setCallState('PROCESSING');
    const fatherText = activeLang === 'ta' ? scenario.tamil : scenario.english;
    setSpokenSubtitle(`Appa (Voice): "${fatherText}"`);

    setTimeout(() => {
      const analysis = heuristic(fatherText, activeLang);
      setActiveResult({ scenario, analysis });

      const replyText = activeLang === 'ta' ? scenario.aiResponseTamil : scenario.aiResponseEnglish;
      setSpokenSubtitle(`TrueSafe AI: "${replyText}"`);
      setAgentSpeaking(true);

      if (scenario.type === 'SCAM') {
        playAlertTone();
        // Save SOS Scam alert to localStorage
        localStorage.setItem('ts_sos_alert', JSON.stringify({
          time: new Date().toLocaleTimeString(),
          type: 'Banking OTP Fraud Attempt',
          caller: 'Father (Appa - Keypad Speed-Dial 9)',
          summary: fatherText,
          advice: analysis.advice,
          cybercrimeDraft: analysis.cybercrimeDraft,
        }));
      } else {
        // Save Urimai Civic Action Kit to localStorage
        const newKit = {
          ...DEFAULT_ACTION_KIT,
          id: `kit_${Date.now()}`,
          timestamp: new Date().toISOString(),
          voiceTranscript: scenario.tamil,
          voiceTranscriptEnglish: scenario.english,
          summary: scenario.english,
          department: analysis.department || 'Town Panchayat Administration',
          grievanceLetter: analysis.grievanceLetter || DEFAULT_ACTION_KIT.grievanceLetter,
          grievanceLetterTamil: analysis.grievanceLetterTamil || DEFAULT_ACTION_KIT.grievanceLetterTamil,
          cmHelplineText: analysis.cmHelplineText || DEFAULT_ACTION_KIT.cmHelplineText,
          status: 'Draft Ready',
        };
        localStorage.setItem('ts_report', JSON.stringify(newKit));
        if (onKitGenerated) onKitGenerated(newKit);
        window.dispatchEvent(new Event('ts_kit_updated'));
      }

      speakText(replyText, activeLang, () => {
        setAgentSpeaking(false);
        setCallState('FINISHED');
      });
    }, 1200);
  };

  // Microphone speech input for custom query
  const toggleLiveMic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert('Speech recognition is not supported in this browser. Please click a scenario button above.');
      return;
    }
    if (isMicListening) {
      recogRef.current?.stop();
      setIsMicListening(false);
      return;
    }
    const r = new SR();
    r.lang = activeLang === 'ta' ? 'ta-IN' : activeLang === 'hi' ? 'hi-IN' : 'en-IN';
    r.interimResults = false;
    r.continuous = false;
    r.onresult = (ev) => {
      const customText = ev.results[0][0].transcript;
      setIsMicListening(false);
      handleCustomSpeech(customText);
    };
    r.onend = () => setIsMicListening(false);
    r.onerror = () => setIsMicListening(false);
    recogRef.current = r;
    setIsMicListening(true);
    r.start();
  };

  const handleCustomSpeech = (text) => {
    setCallState('PROCESSING');
    setSpokenSubtitle(`Appa (Voice): "${text}"`);
    setTimeout(() => {
      const analysis = heuristic(text, activeLang);
      const isCivic = analysis.classification === 'CIVIC_ISSUE';
      const aiReply = isCivic
        ? (activeLang === 'ta'
          ? 'நான் புரிந்து கொண்டேன். உங்களின் பொதுக் குறை குறித்து உரிய துறைக்கு மனு தயார் செய்து உங்கள் மகனின் போனுக்கு அனுப்பியுள்ளேன்.'
          : 'I understand. I have drafted an official civic petition and sent it to your son\'s phone.')
        : (activeLang === 'ta'
          ? 'எச்சரிக்கை! இது நிதி மோசடியாகத் தெரிகிறது. எவருக்கும் OTP பகிர வேண்டாம். உங்கள் குடும்ப டாஷ்போர்டுக்கு எச்சரிக்கை அனுப்பியுள்ளேன்.'
          : 'Warning! This appears to be a financial scam. Never share OTP. I have alerted your family dashboard.');

      setActiveResult({
        scenario: { type: isCivic ? 'CIVIC' : 'SCAM', label: isCivic ? 'Civic Grievance' : 'Cyber Threat' },
        analysis,
      });
      setSpokenSubtitle(`TrueSafe AI: "${aiReply}"`);
      setAgentSpeaking(true);

      if (isCivic) {
        const customKit = {
          ...DEFAULT_ACTION_KIT,
          id: `kit_${Date.now()}`,
          timestamp: new Date().toISOString(),
          voiceTranscript: text,
          voiceTranscriptEnglish: text,
          summary: text,
          department: analysis.department || 'Town Panchayat Administration',
          grievanceLetter: analysis.grievanceLetter || DEFAULT_ACTION_KIT.grievanceLetter,
          grievanceLetterTamil: analysis.grievanceLetterTamil || DEFAULT_ACTION_KIT.grievanceLetterTamil,
          cmHelplineText: analysis.cmHelplineText || DEFAULT_ACTION_KIT.cmHelplineText,
          status: 'Draft Ready',
        };
        localStorage.setItem('ts_report', JSON.stringify(customKit));
        if (onKitGenerated) onKitGenerated(customKit);
        window.dispatchEvent(new Event('ts_kit_updated'));
      } else {
        playAlertTone();
        localStorage.setItem('ts_sos_alert', JSON.stringify({
          time: new Date().toLocaleTimeString(),
          type: analysis.scamType || 'Suspicious Threat',
          caller: 'Father (Appa - Keypad Speed-Dial 9)',
          summary: text,
          advice: analysis.advice,
          cybercrimeDraft: analysis.cybercrimeDraft,
        }));
      }

      speakText(aiReply, activeLang, () => {
        setAgentSpeaking(false);
        setCallState('FINISHED');
      });
    }, 1000);
  };

  return (
    <div className={`card overflow-hidden border border-fg/20 bg-gradient-to-b from-bg to-bg/80 shadow-2xl ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-fg/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent">
            <PhoneCall size={22} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold sm:text-xl">Step 1: Rural Voice AI Lifeline</h3>
            <p className="text-xs text-muted sm:text-sm">Keypad Speed-Dial '9' Simulator (Twilio / Gemini Voice Agent)</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1 text-xs">
          {[['ta', 'தமிழ்'], ['te', 'తెలుగు'], ['hi', 'हिन्दी'], ['kn', 'ಕನ್ನಡ'], ['ml', 'മലയാളം'], ['bn', 'বাংলা'], ['en', 'English']].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setActiveLang(k)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${activeLang === k ? 'bg-accent text-onaccent font-bold' : 'border border-fg/20 text-muted hover:text-fg'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[280px_1fr]">
        {/* Vintage Keypad Phone Device UI */}
        <div className="mx-auto flex w-full max-w-[280px] flex-col rounded-3xl border-4 border-fg/30 bg-[#161a22] p-4 shadow-2xl">
          {/* LCD Screen */}
          <div className="relative mb-3 flex min-h-[120px] flex-col justify-between rounded-xl border-2 border-emerald-900/60 bg-[#0c1c14] p-3 font-mono text-emerald-400 shadow-inner">
            <div className="flex items-center justify-between text-[10px] opacity-75">
              <span>●●● 4G VoLTE</span>
              <span>🔋 92%</span>
            </div>

            <div className="my-auto text-center">
              {callState === 'IDLE' && (
                <div>
                  <p className="text-xs text-emerald-500/80">SPEED-DIAL '9'</p>
                  <p className="text-xl font-bold tracking-widest">{typedDigits || 'Press 9'}</p>
                  <p className="text-[10px] text-emerald-500/60">Press 9 for TrueSafe AI</p>
                </div>
              )}
              {callState === 'DIALING' && (
                <div className="animate-pulse">
                  <p className="text-xs">CALLING...</p>
                  <p className="text-lg font-bold">Speed-Dial [9]</p>
                  <p className="text-[10px]">Connecting Twilio IVR...</p>
                </div>
              )}
              {callState === 'CONNECTED' && (
                <div>
                  <div className="flex items-center justify-center gap-1 text-xs text-emerald-300">
                    <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
                    <span>00:14 · LIVE AI</span>
                  </div>
                  <p className="mt-1 text-xs font-semibold">Gemini Voice Agent</p>
                  {/* Waveform */}
                  <div className="mt-2 flex h-6 items-center justify-center gap-1">
                    {waveformBars.map((h, i) => (
                      <span
                        key={i}
                        className="w-1 rounded-full bg-emerald-400 transition-all duration-150"
                        style={{ height: `${h}px` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {callState === 'PROCESSING' && (
                <div className="animate-pulse">
                  <p className="text-xs">GEMINI INTENT</p>
                  <p className="text-xs font-bold text-amber-300">Classifying Voice...</p>
                  <div className="mt-2 flex justify-center">
                    <Sparkles className="animate-spin text-amber-300" size={16} />
                  </div>
                </div>
              )}
              {callState === 'FINISHED' && (
                <div>
                  <p className="text-xs text-emerald-300">✓ AI HANDOFF DONE</p>
                  <p className="text-[10px] text-emerald-500/80">Sent to Son's Dashboard</p>
                </div>
              )}
            </div>

            <div className="flex justify-between text-[9px] uppercase tracking-wider text-emerald-500/70">
              <span>{callState === 'IDLE' ? 'Options' : 'Mute'}</span>
              <span>{callState === 'IDLE' ? 'Names' : 'End'}</span>
            </div>
          </div>

          {/* Action Call & Hangup Buttons */}
          <div className="mb-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => (callState === 'IDLE' ? startSpeedDial9() : initiateCall())}
              className="flex h-11 items-center justify-center gap-1 rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-lg transition active:scale-95 hover:bg-emerald-500"
              aria-label="Speed-dial 9"
            >
              <Phone size={15} /> <span>Call 9</span>
            </button>
            <button
              onClick={endCall}
              className="flex h-11 items-center justify-center gap-1 rounded-xl bg-rose-600 text-xs font-bold text-white shadow-lg transition active:scale-95 hover:bg-rose-500"
              aria-label="Hang up call"
            >
              <PhoneOff size={15} /> <span>End</span>
            </button>
          </div>

          {/* Keypad Grid 1-9, *, 0, # */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              ['1', '.,_'], ['2', 'ABC'], ['3', 'DEF'],
              ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'],
              ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ (SOS)'],
              ['*', '⌕'], ['0', '+'], ['#', '⇧'],
            ].map(([digit, sub]) => (
              <button
                key={digit}
                onClick={() => (digit === '9' ? startSpeedDial9() : handleDigit(digit))}
                className={`flex h-12 flex-col items-center justify-center rounded-xl border border-fg/10 bg-fg/5 text-fg transition active:scale-90 hover:bg-fg/15 ${
                  digit === '9' ? 'border-accent/40 bg-accent/15 text-accent font-extrabold' : ''
                }`}
              >
                <span className="text-base font-bold leading-none">{digit}</span>
                <span className="text-[8px] font-medium opacity-60 leading-none">{sub}</span>
              </button>
            ))}
          </div>

          <div className="mt-3 text-center">
            <button
              onClick={startSpeedDial9}
              className="btn-primary !w-full !py-2 !text-xs font-bold shadow-md"
            >
              ⚡ Instant Speed-Dial '9'
            </button>
          </div>
        </div>

        {/* Interactive Judge Walkthrough / Scenarios */}
        <div className="flex flex-col justify-between space-y-4">
          <div className="rounded-2xl border border-fg/15 bg-fg/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-accent">Interactive Judge Demo</span>
              <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                Step 2: Gemini Intent Recognition
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">
              Select what the rural father speaks into the button phone, or click <strong>Mic</strong> to speak live:
            </p>

            <div className="mt-3 space-y-2">
              {SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    if (callState === 'IDLE') initiateCall('9');
                    handleScenarioSelect(sc);
                  }}
                  className={`w-full text-left rounded-xl border p-3 transition active:scale-[0.99] ${
                    sc.type === 'CIVIC'
                      ? 'border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20'
                      : 'border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className={sc.type === 'CIVIC' ? 'text-blue-400' : 'text-rose-400'}>{sc.label}</span>
                    <span className="rounded-full bg-fg/10 px-2 py-0.5 text-[10px] uppercase font-mono">{sc.type}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium">{activeLang === 'ta' ? sc.tamil : sc.english}</p>
                </button>
              ))}

              <button
                onClick={() => {
                  if (callState === 'IDLE') initiateCall('9');
                  toggleLiveMic();
                }}
                className={`flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/40 bg-purple-500/10 p-3 text-sm font-bold text-purple-300 transition hover:bg-purple-500/20 ${
                  isMicListening ? 'animate-pulse bg-purple-500/30' : ''
                }`}
              >
                {isMicListening ? <MicOff size={18} /> : <Mic size={18} />}
                <span>{isMicListening ? 'Listening to your voice... (Click to stop)' : '🎙️ Speak Custom Complaint (Web Speech API)'}</span>
              </button>
            </div>
          </div>

          {/* Spoken Audio Subtitles & Real-time AI Status */}
          <div className="rounded-2xl border border-fg/15 bg-bg/90 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-muted">
                <Volume2 size={15} className={agentSpeaking ? 'animate-bounce text-accent' : ''} />
                <span>Audio Transcript & Voice Output</span>
              </span>
              {agentSpeaking && <span className="font-mono text-emerald-400 text-[11px] animate-pulse">● Speaking via WebSpeech</span>}
            </div>

            <div className="mt-2 min-h-[52px] rounded-xl border border-fg/10 bg-fg/5 p-3 text-sm">
              {spokenSubtitle ? (
                <p className="font-medium text-fg">{spokenSubtitle}</p>
              ) : (
                <p className="italic text-muted text-xs">Press Speed-Dial '9' above or choose a scenario to hear the Voice AI speak in Tamil/English.</p>
              )}
            </div>

            {/* AI Outcome & Handoff CTA */}
            <AnimatePresence>
              {activeResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-accent/15 p-3 text-sm font-semibold text-onaccent"
                >
                  <div className="flex items-center gap-2">
                    {activeResult.scenario.type === 'CIVIC' ? (
                      <span className="text-blue-400 font-bold">🏛️ Step 3 Handoff: Urimai Civic Draft Prepared!</span>
                    ) : (
                      <span className="text-rose-400 font-bold">🚨 Step 3 Handoff: Kavach SOS Scam Alert Triggered!</span>
                    )}
                  </div>

                  <button
                    onClick={() => nav('/family')}
                    className="btn-primary !min-h-[38px] !py-1 !text-xs font-bold"
                  >
                    <span>Open Family Hub</span>
                    <ArrowRight size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
