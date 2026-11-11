import { useState } from 'react';
import { X, ArrowRight, Hash, AlertCircle, Loader2 } from 'lucide-react';

export default function JoinRoomModal({ isOpen, onClose, onJoin, initialCode = '' }) {
  const [code, setCode] = useState(initialCode);
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clean = code.replace(/\D/g, '').trim();
    if (!clean || clean.length !== 4) {
      setError('Please enter a 4-digit room code (e.g. 4829).');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onJoin(clean, guestName);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to join room.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 relative animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl">
            <Hash className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Join a Room</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Enter the 6-character room code</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              4-Digit Room Code
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 4));
                  setError('');
                }}
                maxLength={4}
                placeholder="e.g. 4829"
                className="w-full text-center tracking-[0.3em] font-mono text-2xl font-bold py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:font-normal"
                autoFocus
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Codes are 4 numeric digits.</p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all transform active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connecting to room...</span>
                </>
              ) : (
                <>
                  <span>Enter Room</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

