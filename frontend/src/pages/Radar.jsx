import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp, MapPin, ShieldAlert, Video, Eye, EyeOff, Building,
  Sparkles, CheckCircle2, Play, Pause, Volume2, VolumeX, PlusCircle,
  Share2, ArrowRight, PhoneCall, ShieldCheck, Flame
} from 'lucide-react';
import { api } from '../lib/api.js';
import { RADAR_FEED, CIVIC_FEED, VIDEO_FEED, redactPII } from '../lib/demo.js';
import HeroVideo from '../components/HeroVideo.jsx';
import TextReveal from '../components/TextReveal.jsx';
import Avatar3D from '../components/Avatar3D.jsx';
import CanvasExplainer from '../components/CanvasExplainer.jsx';
import AgentAvatarSelector from '../components/AgentAvatarSelector.jsx';

const CITIES = ['All Tamil Nadu', 'Coimbatore', 'Chennai', 'Madurai', 'Trichy', 'Salem'];

export default function Radar() {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'scams', 'civic', 'video'
  const [selectedCity, setSelectedCity] = useState('All Tamil Nadu');
  const [showRedacted, setShowRedacted] = useState(true);
  const [items, setItems] = useState(RADAR_FEED);
  const [civicItems, setCivicItems] = useState(CIVIC_FEED);
  const [videos, setVideos] = useState(VIDEO_FEED);
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [videoMuted, setVideoMuted] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoCategory, setNewVideoCategory] = useState('Banking Fraud');

  useEffect(() => {
    api.radar().then((r) => {
      if (r.items) setItems(r.items);
      if (r.civic) setCivicItems(r.civic);
      if (r.videos) setVideos(r.videos);
    }).catch(() => {
      // fallback to pre-loaded feeds
    });
  }, []);

  const filteredScams = items.filter((it) =>
    selectedCity === 'All Tamil Nadu' ? true : it.area.toLowerCase().includes(selectedCity.toLowerCase())
  );

  const filteredCivic = civicItems.filter((it) =>
    selectedCity === 'All Tamil Nadu' ? true : it.area.toLowerCase().includes(selectedCity.toLowerCase())
  );

  const handleVideoSubmit = (e) => {
    e.preventDefault();
    if (!newVideoTitle.trim()) return;
    const newEntry = {
      id: `vid-${Date.now()}`,
      title: newVideoTitle,
      category: newVideoCategory,
      creator: 'Community Volunteer (Verified)',
      views: 'Just now',
      duration: '0:30',
      verified: true,
      summary: 'Verified community alert on newly emerging phishing pattern reported in Tamil Nadu.',
      videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      poster: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      tags: ['#VerifiedScam', '#CommunitySafety'],
    };
    setVideos([newEntry, ...videos]);
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setShowUploadModal(false);
      setNewVideoTitle('');
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Top Hero Section */}
      <section className="grid items-center gap-6 sm:grid-cols-[1fr_auto]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-bold text-accent mb-3">
            <Sparkles size={14} />
            <span>Hack2Skill Dual Engine: Kavach + Urimai</span>
          </div>
          <TextReveal text="Local Threat & Civic Radar" className="grad-text text-4xl font-extrabold sm:text-5xl" />
          <p className="mt-3 max-w-xl text-base text-muted sm:text-lg">
            Real-time feed of local scams, verified video alerts, and community civic issues powered by Google Gemini privacy redaction.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/scan" className="btn-primary">
              <ShieldCheck size={18} />
              <span>Scan Suspicious Text</span>
            </Link>
            <Link to="/demo" className="btn-ghost">
              <Sparkles size={18} />
              <span>8 Scams Decoded</span>
            </Link>
            <Link to="/family" className="btn-ghost">
              <PhoneCall size={18} />
              <span>Rural Speed-Dial Hub</span>
            </Link>
          </div>
        </div>
        <Avatar3D mood="scanning" size={190} />
      </section>

      {/* Speed-Dial 9 Rural Callout Banner */}
      <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 to-bg p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 font-bold">
            9
          </div>
          <div>
            <h3 className="text-sm font-bold text-blue-300">Feature Phone Speed-Dial '9' Active</h3>
            <p className="text-xs text-muted">Rural parents can press 9 to report scams or broken infrastructure in Tamil/Hindi.</p>
          </div>
        </div>
        <Link to="/family" className="btn-primary !min-h-[36px] !py-1 !text-xs font-bold">
          Open Family Hub
        </Link>
      </div>

      {/* Wordless 3-Panel Explainer Strip (from Chat_Safe) */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs" aria-label="3-step how it works">
        <div className="card border-rose-500/30 bg-rose-950/20 p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 font-black text-lg shrink-0">
            1
          </div>
          <div>
            <p className="font-bold text-rose-300">Danger: Phishing SMS / Call</p>
            <p className="text-muted text-[11px]">Victim receives panic threat about KYC or arrest.</p>
          </div>
        </div>

        <div className="card border-cyan-500/30 bg-cyan-950/20 p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 font-black text-lg shrink-0">
            2
          </div>
          <div>
            <p className="font-bold text-cyan-300">Gemini Neural Scan</p>
            <p className="text-muted text-[11px]">Instant PII redaction and psychological manipulation analysis.</p>
          </div>
        </div>

        <div className="card border-emerald-500/30 bg-emerald-950/20 p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-lg shrink-0">
            3
          </div>
          <div>
            <p className="font-bold text-emerald-300">1930 / Urimai Protection</p>
            <p className="text-muted text-[11px]">1-click 1930 Cybercrime report or legal Panchayat petition.</p>
          </div>
        </div>
      </section>

      {/* Visual Threat Canvas Hero */}
      <HeroVideo />

      {/* 60-Second Real-Time Canvas Story (from SkillForge AI) */}
      <CanvasExplainer />

      {/* Multi-Agent AI Avatar Roster */}
      <AgentAvatarSelector />

      {/* City Filters & Feed Tabs */}
      <div className="space-y-4">
        {/* City Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="font-semibold text-muted shrink-0 flex items-center gap-1">
            <MapPin size={13} /> Region:
          </span>
          {CITIES.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCity(c)}
              className={`rounded-full px-3 py-1 font-semibold transition shrink-0 ${
                selectedCity === c ? 'bg-accent text-onaccent shadow-sm' : 'border border-fg/20 text-muted hover:border-fg/40'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Feed Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-fg/15 pb-2">
          <div className="flex gap-2 text-sm font-bold">
            <button
              onClick={() => setActiveTab('all')}
              className={`rounded-xl px-3.5 py-1.5 transition ${activeTab === 'all' ? 'bg-fg text-bg' : 'text-muted hover:text-fg'}`}
            >
              All Feeds
            </button>
            <button
              onClick={() => setActiveTab('scams')}
              className={`rounded-xl px-3.5 py-1.5 transition ${activeTab === 'scams' ? 'bg-rose-500 text-white' : 'text-muted hover:text-fg'}`}
            >
              🔥 Trending Scams
            </button>
            <button
              onClick={() => setActiveTab('civic')}
              className={`rounded-xl px-3.5 py-1.5 transition ${activeTab === 'civic' ? 'bg-blue-600 text-white' : 'text-muted hover:text-fg'}`}
            >
              ⚠️ Civic Watch
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`rounded-xl px-3.5 py-1.5 transition ${activeTab === 'video' ? 'bg-purple-600 text-white' : 'text-muted hover:text-fg'}`}
            >
              🎬 Video Reels
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRedacted(!showRedacted)}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-fg"
              aria-label="Toggle Gemini privacy redaction"
            >
              {showRedacted ? <EyeOff size={14} className="text-accent" /> : <Eye size={14} />}
              <span>{showRedacted ? 'Gemini [REDACTED] On' : 'Showing Raw Data'}</span>
            </button>

            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary !min-h-[32px] !py-1 !text-xs font-bold"
            >
              <PlusCircle size={14} />
              <span>Post Alert Video</span>
            </button>
          </div>
        </div>
      </div>

      {/* FEED CONTENT GRID */}
      <div className="space-y-8">
        {/* 1. VIDEO REELS SECTION (When 'all' or 'video') */}
        {(activeTab === 'all' || activeTab === 'video') && (
          <section aria-labelledby="video-feed-h" className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 id="video-feed-h" className="flex items-center gap-2 text-xl font-bold">
                <Video className="text-purple-400" size={22} />
                <span>Verified Scam Video News & Reels</span>
              </h2>
              <span className="text-xs text-muted">Daily visual micro-learning</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {videos.map((vid) => (
                <div
                  key={vid.id}
                  className="card group relative flex flex-col overflow-hidden rounded-2xl border border-purple-500/20 bg-bg p-0 shadow-lg"
                >
                  {/* Video Player / Thumbnail */}
                  <div className="relative aspect-[9/10] w-full overflow-hidden bg-black">
                    <img
                      src={vid.poster}
                      alt={vid.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105 opacity-80"
                    />

                    {/* Badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-purple-900/80 px-2.5 py-0.5 text-[10px] font-bold text-purple-200 backdrop-blur-md">
                      <ShieldCheck size={12} className="text-emerald-400" />
                      <span>{vid.category}</span>
                    </div>

                    <div className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white">
                      {vid.duration}
                    </div>

                    {/* Play Overlay Button */}
                    <button
                      onClick={() => setActiveVideoId(activeVideoId === vid.id ? null : vid.id)}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 transition hover:bg-black/20"
                      aria-label="Play scam breakdown video"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/90 text-white shadow-xl transition group-hover:scale-110">
                        {activeVideoId === vid.id ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
                      </div>
                    </button>

                    {/* Playing Video Element */}
                    {activeVideoId === vid.id && (
                      <video
                        src={vid.videoSrc}
                        autoPlay
                        loop
                        playsInline
                        muted={videoMuted}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}

                    {activeVideoId === vid.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setVideoMuted(!videoMuted);
                        }}
                        className="absolute bottom-2 right-2 rounded-full bg-black/75 p-1.5 text-white"
                      >
                        {videoMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      </button>
                    )}
                  </div>

                  {/* Video Meta */}
                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <h3 className="line-clamp-2 text-sm font-extrabold text-fg">{vid.title}</h3>
                      <p className="mt-1 line-clamp-2 text-xs text-muted">{vid.summary}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-fg/10 pt-2 text-[11px] text-muted">
                      <span className="font-medium text-emerald-400">✓ {vid.creator}</span>
                      <span>{vid.views}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2. TRENDING SCAM THREATS (When 'all' or 'scams') */}
        {(activeTab === 'all' || activeTab === 'scams') && (
          <section aria-labelledby="threat-feed-h" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 id="threat-feed-h" className="flex items-center gap-2 text-xl font-bold">
                <TrendingUp className="text-rose-500" size={22} />
                <span>Live Scam Threat Scroll</span>
              </h2>
              <span className="text-xs text-muted">
                {filteredScams.length} active patterns in {selectedCity}
              </span>
            </div>

            <ol className="space-y-3">
              {filteredScams.map((it, i) => (
                <motion.li
                  key={it.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card relative overflow-hidden border-l-8 border-l-rose-500 p-5 shadow-md"
                >
                  <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-3 py-1 font-bold text-rose-400">
                      <ShieldAlert size={14} />
                      <span>{it.type}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-muted">
                      <MapPin size={13} />
                      <span>{it.area}</span>
                    </span>
                    <span className="rounded-md bg-fg/10 px-2 py-0.5 text-[10px] font-mono text-muted">
                      {it.time || 'Trending'}
                    </span>
                    <span className="ml-auto font-mono text-rose-400 font-bold">
                      🔥 {it.hits} community reports
                    </span>
                  </div>

                  <p className="mt-3 text-base font-medium leading-relaxed">
                    {showRedacted ? redactPII(it.text) : (it.rawText || it.text)}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-xs text-muted">
                    <span className="text-[11px] italic">
                      {showRedacted ? 'Protected by Gemini Auto-Redaction' : 'Warning: Unredacted raw report'}
                    </span>
                    <Link to="/scan" className="font-bold text-accent hover:underline">
                      Verify Similar Message →
                    </Link>
                  </div>
                </motion.li>
              ))}
            </ol>
          </section>
        )}

        {/* 3. CIVIC WATCH SECTION (When 'all' or 'civic') */}
        {(activeTab === 'all' || activeTab === 'civic') && (
          <section aria-labelledby="civic-feed-h" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 id="civic-feed-h" className="flex items-center gap-2 text-xl font-bold">
                <Building className="text-blue-400" size={22} />
                <span>Civic Watch: Public Grievance Stream</span>
              </h2>
              <span className="text-xs text-muted">Urimai community reports</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {filteredCivic.map((c) => (
                <div
                  key={c.id}
                  className="card border-l-4 border-l-blue-500 p-4 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-400">{c.department}</span>
                      <span className="text-muted">{c.time}</span>
                    </div>
                    <h3 className="mt-1 text-base font-bold text-fg">{c.title}</h3>
                    <p className="mt-1 text-xs text-muted flex items-center gap-1">
                      <MapPin size={12} />
                      <span>{c.area}</span>
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-fg/10 flex items-center justify-between text-xs">
                    <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-300">
                      {c.status}
                    </span>
                    <Link to="/family" className="font-semibold text-accent hover:underline">
                      View Action Kit →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* POST / SUBMIT SCAM VIDEO MODAL */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-fg/20 bg-bg p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-fg/10 pb-3">
                <h3 className="text-base font-bold">Post Verified Scam Alert Video</h3>
                <button onClick={() => setShowUploadModal(false)} className="text-muted hover:text-fg">✕</button>
              </div>

              {uploadSuccess ? (
                <div className="py-8 text-center">
                  <CheckCircle2 size={40} className="mx-auto text-emerald-400" />
                  <p className="mt-3 text-base font-bold text-emerald-400">Scam Alert Video Published!</p>
                  <p className="mt-1 text-xs text-muted">Added to the community Radar video news feed.</p>
                </div>
              ) : (
                <form onSubmit={handleVideoSubmit} className="mt-4 space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">Scam Alert Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TNEB Disconnection SMS Scam in Salem"
                      value={newVideoTitle}
                      onChange={(e) => setNewVideoTitle(e.target.value)}
                      className="w-full rounded-xl border border-fg/30 bg-transparent p-2.5 text-xs text-fg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Scam Family Category</label>
                    <select
                      value={newVideoCategory}
                      onChange={(e) => setNewVideoCategory(e.target.value)}
                      className="w-full rounded-xl border border-fg/30 bg-bg p-2.5 text-xs text-fg"
                    >
                      <option>Banking Fraud</option>
                      <option>Digital Arrest</option>
                      <option>Electricity Bill Scam</option>
                      <option>AI Voice Clone</option>
                      <option>Job Task Trap</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Upload Video File or Screen Recording</label>
                    <div className="rounded-xl border-2 border-dashed border-fg/20 p-4 text-center">
                      <Video size={24} className="mx-auto text-accent mb-1" />
                      <p className="text-[11px] text-muted">MP4 or WebM up to 50MB</p>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="btn-ghost flex-1 !py-2 !text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary flex-1 !py-2 !text-xs font-bold"
                    >
                      Verify & Publish
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
