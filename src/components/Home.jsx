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
  Lock,
  Zap,
  ShieldCheck
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
      addToast('Please enter all 4 digits', 'error');
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
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#06b6d4', '#10b981']
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
      addToast('Authenticated with Google', 'success');
    } catch (err) {
      addToast(err.message || 'Google sign-in failed.', 'error');
    } finally {
      setAuthSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-14 max-w-md mx-auto w-full relative z-10">
      {/* ── Simple, Clean Hero Header ─────────────────── */}
      <div className="text-center mb-8 animate-fade-up">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight text-white">
          Quick<span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Chat</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">
          Instant ephemeral rooms with a 4-digit code. Zero login required.
        </p>
      </div>

      {/* Firebase setup notice */}
      {authError && (
        <div className="w-full mb-5 p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 shadow-md">
          <div className="font-bold mb-1.5 flex items-center justify-between text-sm">
            <span>Firebase Authentication Required</span>
            <a
              href="https://console.firebase.google.com/project/dialy-water/authentication/providers"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-indigo-400 font-bold underline hover:no-underline font-mono"
            >
              Console <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <p className="leading-relaxed opacity-90">
            In Firebase Console &gt; Authentication, enable <strong>Anonymous</strong> &amp; <strong>Google</strong> sign-in.
          </p>
        </div>
      )}

      {/* ── Simple Main Card ─────────────────────────── */}
      <div className="w-full glass-panel rounded-3xl shadow-luxury overflow-hidden animate-fade-up">
        {/* Navigation Tabs */}
        <div className="flex p-1.5 bg-slate-900/70 border-b border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('join')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold rounded-2xl transition-all duration-150 cursor-pointer ${
              activeTab === 'join'
                ? 'bg-slate-800 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Hash className="w-4 h-4 text-indigo-400" />
            <span>Join with Code</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold rounded-2xl transition-all duration-150 cursor-pointer ${
              activeTab === 'create'
                ? 'bg-slate-800 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4 text-purple-400" />
            <span>Create Room</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {activeTab === 'join' ? (
            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <div className="text-center">
                <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2.5">
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
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Your nickname
                  </label>
                  <input
                    type="text"
                    value={guestNameInput}
                    onChange={(e) => setGuestNameInput(e.target.value)}
                    maxLength={25}
                    placeholder="e.g. Alex, Sam, Dev"
                    className="w-full text-sm font-semibold py-2.5 px-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || roomCodeInput.length !== 4}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-indigo-600/25"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Enter Room</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Room title <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <input
                  type="text"
                  value={customRoomName}
                  onChange={(e) => setCustomRoomName(e.target.value)}
                  maxLength={40}
                  placeholder="e.g. Coffee Break, Team Standup"
                  autoFocus
                  className="w-full text-sm font-semibold py-2.5 px-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
                <p className="text-[11px] font-medium text-slate-400 mt-1.5">
                  Generates an instant 4-digit code (e.g. #7829)
                </p>
              </div>

              {!currentUser && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Your nickname
                  </label>
                  <input
                    type="text"
                    value={guestNameInput}
                    onChange={(e) => setGuestNameInput(e.target.value)}
                    maxLength={25}
                    placeholder="e.g. Alex, Sam, Dev"
                    className="w-full text-sm font-semibold py-2.5 px-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-purple-600/25"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Generate Code &amp; Launch</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Card Footer / Google Auth */}
        {!currentUser && (
          <div className="px-6 py-3.5 border-t border-white/5 bg-slate-950/70 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">
              Or sign in with:
            </span>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={authSubmitting}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-white/10 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all shadow-sm cursor-pointer"
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
                  <span>Google</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Trust Badges Simple Row */}
      <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-400 mt-6">
        <span className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-slate-400" /> Private Room
        </span>
        <span>&bull;</span>
        <span className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-emerald-400" /> Realtime
        </span>
        <span>&bull;</span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> No Tracking
        </span>
      </div>
    </div>
  );
}
