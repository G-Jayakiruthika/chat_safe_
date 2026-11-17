/**
 * TrueSafe Audio Utility
 * Generates telephone DTMF tones, ringback sounds, and multi-lingual voice synthesis.
 */

let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) audioCtx = new AudioCtx();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Standard DTMF keypad frequencies
const DTMF_FREQS = {
  '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
  '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
  '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
  '*': [941, 1209], '0': [941, 1336], '#': [941, 1477],
};

/** Play standard telephone DTMF tone */
export function playDtmfTone(digit, durationMs = 180) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const freqs = DTMF_FREQS[digit] || [440, 440];
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.frequency.value = freqs[0];
    osc2.frequency.value = freqs[1];
    osc1.type = 'sine';
    osc2.type = 'sine';

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + durationMs / 1000);
    osc2.stop(ctx.currentTime + durationMs / 1000);
  } catch (e) {
    console.debug('Audio error', e);
  }
}

/** Play telephone ringing tone */
export function playRingingTone() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.frequency.value = 400;
    osc2.frequency.value = 450;
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 1.2);
    osc2.stop(ctx.currentTime + 1.2);
  } catch (e) {
    console.debug('Ring error', e);
  }
}

/** Play alert siren */
export function playAlertTone() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    console.debug('Alert tone error', e);
  }
}

/** Multi-lingual speech synthesis */
export function speakText(text, lang = 'ta', onEnd) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (onEnd) onEnd();
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const ut = new SpeechSynthesisUtterance(text);
    const langMap = { ta: 'ta-IN', hi: 'hi-IN', en: 'en-IN' };
    ut.lang = langMap[lang] || 'en-IN';
    ut.rate = 0.95;
    ut.pitch = 1.0;

    // Pick best available matching voice
    const voices = window.speechSynthesis.getVoices?.() || [];
    const targetVoice = voices.find((v) => v.lang.startsWith(ut.lang) || v.lang.includes(lang));
    if (targetVoice) ut.voice = targetVoice;

    if (onEnd) ut.onend = onEnd;
    ut.onerror = () => onEnd?.();

    window.speechSynthesis.speak(ut);
  } catch (err) {
    console.warn('Speech error', err);
    onEnd?.();
  }
}
