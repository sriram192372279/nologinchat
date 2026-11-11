import { useState, useRef, useEffect } from 'react';
import { Palette, Check, X, Sparkles } from 'lucide-react';
import { CHAT_THEMES } from '../constants/chatThemes';

export default function WallpaperSelector({ currentTheme, onSelectTheme }) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    function handlePointerDownOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('pointerdown', handlePointerDownOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (themeId) => {
    onSelectTheme(themeId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        title="Customize chat wallpaper theme"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 ${
          isOpen
            ? 'bg-indigo-600 text-white border border-indigo-500 shadow-glow-indigo'
            : 'text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900/90 dark:hover:bg-slate-800 border border-slate-300/70 dark:border-white/10'
        }`}
      >
        <Palette className="w-3.5 h-3.5 text-indigo-500" />
        <span className="hidden sm:inline">Theme</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] p-3.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-white/15 z-[60] animate-scale-up"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-white/10">
            <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Chat Wallpaper Themes
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {CHAT_THEMES.map((theme) => {
              const isSelected = theme.id === currentTheme;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleSelect(theme.id)}
                  className={`flex flex-col items-start p-2 rounded-2xl border-2 text-left transition-all duration-150 cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-sm'
                      : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50/60 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className={`w-full h-8 rounded-xl mb-1.5 border shadow-inner flex items-center justify-end p-1 ${theme.swatch}`}>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {theme.name}
                  </span>
                  <span className="text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    {theme.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
