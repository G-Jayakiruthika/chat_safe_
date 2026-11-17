import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Building, PhoneCall, Sparkles, Volume2 } from 'lucide-react';
import Avatar3D from './Avatar3D.jsx';

export const AGENT_ROSTER = [
  {
    id: 'kavach',
    name: 'Kavach Sentinel',
    role: 'Cyber Threat & Anti-Fraud Engine',
    icon: Shield,
    accentColor: '#22d3ee',
    states: ['calm', 'happy', 'scanning', 'angry'],
    desc: 'Monitors digital arrest, bank KYC phishing, fake APKs, and 1930 reporting.',
    defaultMood: 'calm',
  },
  {
    id: 'urimai',
    name: 'Urimai Advocate',
    role: 'Civic Grievance & O2O Rights Engine',
    icon: Building,
    accentColor: '#38bdf8',
    states: ['scanning', 'calm', 'happy'],
    desc: 'Drafts legal petitions under TN Panchayats Act 1994, attaches evidence & citizen signatures.',
    defaultMood: 'scanning',
  },
  {
    id: 'voice',
    name: 'Sage Voice AI',
    role: 'Twilio Speed-Dial 9 Audio Agent',
    icon: PhoneCall,
    accentColor: '#8b5cff',
    states: ['calm', 'scanning'],
    desc: 'Listens to button-phone rural callers in 23 Indian languages and executes AI handoffs.',
    defaultMood: 'scanning',
  },
];

export default function AgentAvatarSelector({ onSelectAgent, compact = false }) {
  const [activeAgent, setActiveAgent] = useState('kavach');
  const [activeMood, setActiveMood] = useState('calm');

  const cur = AGENT_ROSTER.find((a) => a.id === activeAgent) || AGENT_ROSTER[0];

  return (
    <div className={`card overflow-hidden border border-fg/20 p-5 ${compact ? 'max-w-md' : 'w-full'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-fg/10 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-accent" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Multi-Agent AI Roster</h3>
        </div>
        <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] font-mono font-bold text-accent">
          Active: {cur.name}
        </span>
      </div>

      <div className="mt-4 grid gap-6 md:grid-cols-[200px_1fr] items-center">
        {/* 3D Interactive Canvas Avatar */}
        <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-fg/5 border border-fg/10">
          <Avatar3D mood={activeMood} size={150} />
          <div className="mt-2 flex gap-1">
            {cur.states.map((m) => (
              <button
                key={m}
                onClick={() => setActiveMood(m)}
                className={`rounded-md px-2 py-0.5 text-[10px] font-mono capitalize transition ${
                  activeMood === m ? 'bg-accent text-onaccent font-bold' : 'bg-fg/10 text-muted hover:text-fg'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-muted mt-1">Tap mood to preview expressions</span>
        </div>

        {/* Agent Cards Switcher */}
        <div className="space-y-2.5">
          {AGENT_ROSTER.map((ag) => {
            const Icon = ag.icon;
            const isSelected = activeAgent === ag.id;
            return (
              <button
                key={ag.id}
                onClick={() => {
                  setActiveAgent(ag.id);
                  setActiveMood(ag.defaultMood);
                  onSelectAgent?.(ag);
                }}
                className={`w-full rounded-2xl border p-3 text-left transition flex items-start gap-3 ${
                  isSelected
                    ? 'border-accent bg-accent/15 shadow-md'
                    : 'border-fg/15 bg-fg/5 hover:border-fg/30'
                }`}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
                  style={{
                    backgroundColor: isSelected ? 'rgba(34, 211, 238, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: ag.accentColor,
                  }}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-fg">{ag.name}</p>
                    <span className="text-[10px] text-muted font-mono">{ag.role.split(' ')[0]}</span>
                  </div>
                  <p className="text-[11px] text-muted line-clamp-1 mt-0.5">{ag.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
