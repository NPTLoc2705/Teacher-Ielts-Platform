import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface Toast {
  id: string;
  type?: 'success' | 'error' | 'info';
  variant?: 'destructive' | 'default' | 'success';
  title: string;
  description?: string;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((opts: Omit<Toast, 'id'>) => {
    const effectiveType = opts.type || (opts.variant === 'destructive' ? 'error' : opts.variant === 'success' ? 'success' : 'info');
    const preparedOpts = { ...opts, type: effectiveType };
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...preparedOpts, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 rounded-lg p-4 border text-sm ${
              t.type === 'success' ? 'bg-[#e3faf7] border-[#a7f0e6] text-[#0d746f]' :
              t.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
              'bg-[#eaf2fd] border-[#c6dcfa] text-[#183a68]'
            }`}
          >
            {t.type === 'success' ? <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" /> :
             t.type === 'error' ? <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> :
             <Info className="h-4 w-4 mt-0.5 shrink-0" />}
            <div className="flex-1">
              <p className="font-semibold">{t.title}</p>
              {t.description && <p className="text-xs opacity-80 mt-0.5">{t.description}</p>}
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="opacity-60 hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
