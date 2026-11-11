import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, Check, X, Pencil, MessageSquare, Zap } from 'lucide-react';

export default function Navbar({ onLeaveRoom, inRoom }) {
  const { currentUser, username, updateDisplayName, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  const startEdit = () => {
    setTempName(username);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (tempName.trim()) {
      await updateDisplayName(tempName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all">
      <div className="w-full bg-white/75 dark:bg-slate-950/75 backdrop-blur-xl border-b border-slate-200/70 dark:border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo & Status */}
          <div
            onClick={inRoom ? onLeaveRoom : undefined}
            className={`flex items-center gap-3 select-none ${inRoom ? 'cursor-pointer group' : ''}`}
          >
            <div className="relative">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[1px] shadow-glow-indigo group-hover:scale-105 transition-transform duration-200">
                <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[15px] flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400 fill-indigo-500/20" />
                </div>
              </div>
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-slate-950"></span>
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                  Quick<span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">Chat</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wide bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                  <Zap className="w-2.5 h-2.5 fill-indigo-500" />
                  REALTIME
                </span>
              </div>
              {inRoom && (
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1 group-hover:text-rose-500 transition-colors">
                  &larr; Click logo to exit room
                </span>
              )}
            </div>
          </div>

          {/* Right Header Navigation & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Authenticated User Pill */}
            {currentUser && (
              <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 rounded-full pl-1.5 pr-3 py-1 border border-slate-200 dark:border-white/10 shadow-sm transition-all duration-150">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={username}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/60 shadow-sm"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                    {username ? username.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}

                {isEditingName ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') setIsEditingName(false);
                      }}
                      maxLength={25}
                      className="w-24 text-xs font-semibold bg-white dark:bg-slate-950 border-2 border-indigo-500 rounded-lg px-2 py-0.5 outline-none text-slate-900 dark:text-white"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="p-1 rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 max-w-[110px] sm:max-w-[140px] truncate">
                      {username || 'Anonymous'}
                    </span>
                    <button
                      onClick={startEdit}
                      title="Edit display name"
                      className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {currentUser.isAnonymous ? 'Guest' : 'Google'}
                </span>
              </div>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-sm transition-all duration-200 cursor-pointer active:scale-95"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-90 transition-transform duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            {/* Logout Action */}
            {currentUser && (
              <button
                onClick={logout}
                title="Disconnect Account"
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/40 transition-all duration-150 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
