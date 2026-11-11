export const CHAT_THEMES = [
  {
    id: 'default',
    name: 'Clean Grid',
    badge: 'Classic',
    icon: '🔲',
    isDarkTheme: false,
    wrapperClass: 'bg-white/95 dark:bg-slate-950/95 bg-grid-ambient text-slate-900 dark:text-slate-100',
    bubbleOther: 'bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white border-slate-200 dark:border-white/10',
    swatch: 'bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 border-slate-300 dark:border-white/10'
  },
  {
    id: 'cosmic',
    name: 'Cosmic Sky',
    badge: 'Stars',
    icon: '✨',
    isDarkTheme: true,
    wrapperClass: 'bg-gradient-to-b from-[#070814] via-[#0e0c24] to-[#060712] bg-stars-pattern text-white',
    bubbleOther: 'bg-slate-900/90 text-white border-indigo-500/30 shadow-lg shadow-indigo-950/50',
    swatch: 'bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 border-indigo-400/50'
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    badge: 'Warm',
    icon: '🌅',
    isDarkTheme: false,
    wrapperClass: 'bg-gradient-to-br from-amber-50/90 via-rose-50/90 to-orange-100/70 dark:from-[#1c0f16] dark:via-[#19101c] dark:to-[#130f18] text-slate-900 dark:text-slate-100',
    bubbleOther: 'bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white border-rose-200/60 dark:border-rose-900/40 shadow-sm',
    swatch: 'bg-gradient-to-br from-amber-400 via-rose-400 to-orange-500 border-rose-300/60'
  }
];
