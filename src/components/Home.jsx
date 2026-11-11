import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DigitCodeInput from './DigitCodeInput';
import confetti from 'canvas-confetti';
import {
  ArrowRight,
  Hash,
  Plus,
  Loader2,
  ExternalLink,
  Zap,
  ShieldCheck,
  Sparkles,
  Flame,
  Volume2,
  Palette,
  Users
} from 'lucide-react';

export default function Home({ onCreateRoom, onJoinRoom, inviteCode }) {
  const { currentUser, username, loginWithGoogle, loginAsGuest, authError } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('join'); // 'join' | 'create'
  const [roomCodeInput, setRoomCodeInput] = useState(inviteCode ? inviteCode.replace(/\D/g, '').slice(0, 4) : '');
  const [customRoomName, setCustomRoomName] = useState('');
  const [guestNameInput, setGuestNameInput] = useState(username || '');
  const [submitting, setSubmitting] = useState(false);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  useEffect(() => {
    if (inviteCode) {
      setRoomCodeInput(inviteCode.replace(/\D/g, '').slice(0, 4));
      setActiveTab('join');
    }
  }, [inviteCode]);

  useEffect(() => {
    if (username && !guestNameInput) {
      setGuestNameInput(username);
    }
  }, [username, guestNameInput]);

  const handleEnsureAuth = async () => {
    if (currentUser) return currentUser;
    const finalName = guestNameInput.trim() || `Guest_${Math.floor(1000 + Math.random() * 9000)}`;
    return await loginAsGuest(finalName);
  };

  const handleJoinSubmit = async (e) => {
    if (e) e.preventDefault();
    const cleanCode = roomCodeInput.replace(/\D/g, '').trim();
    if (!cleanCode || cleanCode.length !== 4) {
      addToast('Please enter all 4 digits (e.g. 4829)', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await handleEnsureAuth();
      await onJoinRoom(cleanCode);
    } catch (err) {
      addToast(err.message || 'Failed to join room.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    try {
      await handleEnsureAuth();
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b']
      });
      await onCreateRoom(customRoomName.trim());
    } catch (err) {
      addToast(err.message || 'Failed to create room.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthSubmitting(true);
    try {
      await loginWithGoogle();
      addToast('Authenticated via Google', 'success');
    } catch (err) {
      addToast(err.message || 'Google sign-in failed.', 'error');
    } finally {
      setAuthSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-16 max-w-4xl mx-auto w-full relative z-10">
      {/* ── Top Announcement Tag ───────────────────────── */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-6 shadow-sm backdrop-blur-md animate-fade-up">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
        </span>
        <span className="font-mono uppercase tracking-wider text-[11px]">Instant Room Protocol v2.5</span>
        <span className="text-slate-300 dark:text-slate-700">&bull;</span>
        <span className="font-medium">4-Digit PIN Access</span>
      </div>

      {/* ── Hero Heading ($1000 Headline) ──────────────── */}
      <div className="text-center mb-10 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.08s' }}>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight text-slate-900 dark:text-white leading-[1.1]">
          Connect Instantly. <br />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
            Zero Friction. Pure Speed.
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-4 leading-relaxed font-normal">
          Jump into high-speed private chat rooms with a simple 4-digit code. No email verification, zero app downloads, real-time live sync.
        </p>
      </div>

      {/* Firebase setup notice */}
      {authError && (
        <div className="w-full max-w-lg mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-200 shadow-md">
          <div className="font-bold mb-1.5 flex items-center justify-between text-sm">
            <span>Firebase Authentication Setup Required</span>
            <a
              href="https://console.firebase.google.com/project/dialy-water/authentication/providers"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold underline hover:no-underline font-mono"
            >
              Console <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <p className="leading-relaxed opacity-95">
            In Firebase Console &gt; Authentication &gt; Sign-in method, click <strong>Get Started</strong> and toggle <strong>Anonymous</strong> &amp; <strong>Google</strong> to ON.
          </p>
        </div>
      )}

      {/* ── Main Command Card ($1000 Glass Card) ──────── */}
      <div className="w-full max-w-md mx-auto glass-panel rounded-3xl shadow-luxury dark:shadow-luxury overflow-hidden animate-fade-up relative" style={{ animationDelay: '0.15s' }}>
        {/* Shimmering gradient top line */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400" />

        {/* Navigation Tabs */}
        <div className="flex p-2 bg-slate-100/70 dark:bg-slate-900/60 border-b border-slate-200/60 dark:border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('join')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-bold rounded-2xl transition-all duration-200 cursor-pointer ${
              activeTab === 'join'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Hash className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Join with Code</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-bold rounded-2xl transition-all duration-200 cursor-pointer ${
              activeTab === 'create'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Create New Room</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 sm:p-7">
          {activeTab === 'join' ? (
            <form onSubmit={handleJoinSubmit} className="space-y-5">
              <div className="text-center">
                <label className="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Enter 4-Digit Room Code
                </label>
                <DigitCodeInput
                  value={roomCodeInput}
                  onChange={setRoomCodeInput}
                  onComplete={() => {
                    setTimeout(handleJoinSubmit, 150);
                  }}
                  autoFocus={true}
                />
              </div>

              {!currentUser && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Your display nickname
                  </label>
                  <input
                    type="text"
                    value={guestNameInput}
                    onChange={(e) => setGuestNameInput(e.target.value)}
                    maxLength={25}
                    placeholder="e.g. Alex, Sam, Dev"
                    className="w-full text-sm font-semibold py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || roomCodeInput.length !== 4}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold flex items-center justify-center gap-2.5 transition-all duration-150 active:scale-[0.98] cursor-pointer shadow-lg shadow-indigo-600/25"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Enter Instant Room</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Room title <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={customRoomName}
                  onChange={(e) => setCustomRoomName(e.target.value)}
                  maxLength={40}
                  placeholder="e.g. Project Brainstorm, Coffee Chat"
                  autoFocus
                  className="w-full text-sm font-semibold py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  Generates an instant 4-digit code (e.g. #7829)
                </p>
              </div>

              {!currentUser && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Your display nickname
                  </label>
                  <input
                    type="text"
                    value={guestNameInput}
                    onChange={(e) => setGuestNameInput(e.target.value)}
                    maxLength={25}
                    placeholder="e.g. Alex, Sam, Dev"
                    className="w-full text-sm font-semibold py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold flex items-center justify-center gap-2.5 transition-all duration-150 active:scale-[0.98] cursor-pointer shadow-lg shadow-purple-600/25"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Generate PIN &amp; Launch</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Card Footer / Google Auth */}
        {!currentUser && (
          <div className="px-6 py-4 border-t border-slate-200/60 dark:border-white/5 bg-slate-50/70 dark:bg-slate-950/70 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              Want verified status?
            </span>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={authSubmitting}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              {authSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.66-5.17 3.66-9.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.1C3.27 21.43 7.35 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.32a7.18 7.18 0 0 1 0-4.64V6.58H1.25a11.96 11.96 0 0 0 0 10.84l4.03-3.1z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.57 1.25 6.58l4.03 3.1c.95-2.83 3.6-4.93 6.72-4.93z"
                    />
                  </svg>
                  <span>Google Sign In</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── World-Class Bento Feature Showcase ─────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mt-12 animate-fade-up" style={{ animationDelay: '0.22s' }}>
        <div className="p-5 rounded-2xl glass-panel text-left flex flex-col gap-2.5 shadow-sm hover:scale-[1.02] transition-transform duration-200">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Hash className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
            4-Digit Numeric PIN
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            No messy URLs, links, or hashes. Share an easy 4-digit code (e.g. #4829) anyone can type in seconds.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel text-left flex flex-col gap-2.5 shadow-sm hover:scale-[1.02] transition-transform duration-200">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
            0ms Real-Time Sync
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            Instant bidirectional message streaming powered by Firestore live snapshot listeners. Zero lag.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel text-left flex flex-col gap-2.5 shadow-sm hover:scale-[1.02] transition-transform duration-200">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
            <Palette className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
            Audio &amp; Themes
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            Web Audio synthesized sound effects, 3 curated chat themes, confetti explosions, and quick reactions.
          </p>
        </div>
      </div>
    </div>
  );
}
