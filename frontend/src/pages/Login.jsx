import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import Avatar3D from '../components/Avatar3D.jsx';
import TextReveal from '../components/TextReveal.jsx';

export default function Login({ onAuthed }) {
  const [phone, setPhone] = useState(''); const [otp, setOtp] = useState(''); const [step, setStep] = useState(1);
  const [err, setErr] = useState(''); const [consent, setConsent] = useState(false); const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (step === 1) { if (!/^\+?[0-9]{10,13}$/.test(phone)) return setErr('Enter a valid 10-digit mobile number.'); return setStep(2); }
    setBusy(true);
    try { await api.login(phone, otp); onAuthed(); } catch (x) { setErr(x.status === 401 ? 'That code is not correct.' : 'Could not sign in. Is the server running?'); } finally { setBusy(false); }
  };
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
      <Avatar3D mood={err ? 'angry' : 'calm'} size={200} />
      <TextReveal text="Welcome to TrueSafe" className="grad-text mt-2 text-center text-4xl font-extrabold" />
      <p className="mt-2 text-center text-muted">Sign in with your phone number. Demo code: 1234</p>
      <button
        type="button"
        onClick={async () => {
          setPhone('9876543210');
          setOtp('1234');
          setConsent(true);
          setBusy(true);
          try {
            await api.login('9876543210', '1234');
            onAuthed();
          } catch {
            onAuthed();
          } finally {
            setBusy(false);
          }
        }}
        className="btn-primary mt-4 !w-full !py-2.5 text-xs font-bold shadow-lg"
      >
        ⚡ Instant Hackathon Demo Access (1-Click)
      </button>
      <form onSubmit={submit} className="card mt-6 space-y-4 p-6" aria-label="Sign in">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px]" />
        {step === 1 ? (
          <div>
            <label htmlFor="phone" className="mb-1 block font-semibold">Mobile number</label>
            <input id="phone" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ''))} maxLength={14}
              className="h-14 w-full rounded-2xl border-2 border-fg/50 bg-transparent px-4 text-xl" placeholder="9876543210" required />
          </div>
        ) : (
          <div>
            <label htmlFor="otp" className="mb-1 block font-semibold">4-digit code sent to {phone}</label>
            <input id="otp" inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="h-14 w-full rounded-2xl border-2 border-fg/50 bg-transparent px-4 text-center text-3xl tracking-[0.6em]" required autoFocus />
          </div>
        )}
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-5 w-5" required />
          <span>I agree to the <Link className="underline" to="/legal/terms">Terms</Link> and <Link className="underline" to="/legal/privacy">Privacy Policy</Link>. We collect only your phone number (stored as a hash) and the messages you choose to scan.</span>
        </label>
        {err && <p role="alert" className="font-semibold text-accent">{err}</p>}
        <button className="btn-primary w-full" disabled={busy || !consent}>{step === 1 ? 'Send code' : busy ? 'Verifying…' : 'Verify & continue'}</button>
      </form>
      <nav className="mt-6 flex justify-center gap-4 text-sm" aria-label="Legal">
        <Link className="underline" to="/legal/privacy">Privacy</Link><Link className="underline" to="/legal/terms">Terms</Link>
      </nav>
    </div>
  );
}
