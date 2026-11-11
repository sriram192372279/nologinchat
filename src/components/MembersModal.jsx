import { X, Users, Crown, Sparkles } from 'lucide-react';

const USER_PALETTE = [
  'from-indigo-600 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-blue-600',
  'from-fuchsia-600 to-purple-600',
];

function getAvatarGradient(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return USER_PALETTE[Math.abs(hash) % USER_PALETTE.length];
}

export default function MembersModal({ isOpen, onClose, members, creatorId, currentUserId }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm glass-panel rounded-3xl shadow-2xl p-6 relative max-h-[80vh] flex flex-col animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                Active Participants
              </h2>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {members.length} {members.length === 1 ? 'member' : 'members'} online
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Member List */}
        <div className="overflow-y-auto py-3.5 flex-1 space-y-2.5 no-scrollbar">
          {members.map((m) => {
            const isCreator = m.userId === creatorId;
            const isMe = m.userId === currentUserId;
            const gradient = getAvatarGradient(m.username || '');

            return (
              <div
                key={m.id || m.userId}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all text-xs border border-slate-200/70 dark:border-white/5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${gradient} text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm`}>
                    {m.username ? m.username.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-white truncate">
                      {m.username || 'Anonymous'}
                    </span>
                    {isMe && (
                      <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                        You
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isCreator && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      <Crown className="w-3 h-3 text-amber-500" /> Host
                    </span>
                  )}
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200/60 dark:border-white/10">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-indigo-600/20 active:scale-[0.98]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
