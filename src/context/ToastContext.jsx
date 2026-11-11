import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold border shadow-2xl backdrop-blur-xl transition-all duration-200 animate-scale-up ${
              toast.type === 'error'
                ? 'bg-rose-50/95 text-rose-950 border-rose-300 dark:bg-rose-950/90 dark:text-rose-100 dark:border-rose-800 shadow-rose-500/10'
                : toast.type === 'success'
                ? 'bg-slate-900/95 text-white border-slate-700 dark:bg-white/95 dark:text-slate-950 dark:border-slate-200 shadow-indigo-500/15'
                : 'bg-white/95 text-slate-900 border-slate-200 dark:bg-slate-900/95 dark:text-slate-100 dark:border-white/10 shadow-slate-950/20'
            }`}
          >
            <div className="flex items-center gap-2.5 pr-2 min-w-0">
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              ) : toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
              )}
              <span className="leading-snug truncate">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
