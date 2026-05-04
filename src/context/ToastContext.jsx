import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

// ── Icons ──────────────────────────────────────────────────────────────────
const icons = {
  success: (
    <svg
      viewBox="0 0 20 20"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 10l4.5 4.5L16 6" />
    </svg>
  ),
  fav: (
    <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor">
      <path d="M10 17s-7-4.5-7-9a4 4 0 0 1 7-2.65A4 4 0 0 1 17 8c0 4.5-7 9-7 9z" />
    </svg>
  ),
  remove: (
    <svg
      viewBox="0 0 20 20"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  ),
  warning: (
    <svg
      viewBox="0 0 20 20"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M10 3L2 17h16L10 3z" />
      <path d="M10 9v4M10 14.5v.5" />
    </svg>
  ),
};

const styles = {
  success: {
    wrap: "bg-[#1e1208] border-[#5a3a20]/60",
    icon: "bg-[#936137]/20 text-[#c89060]",
    text: "text-[#e8c99a]",
  },
  fav: {
    wrap: "bg-[#1e0808] border-[#7a2a2a]/60",
    icon: "bg-[#c0392b]/20 text-[#e07070]",
    text: "text-[#f0b0b0]",
  },
  remove: {
    wrap: "bg-[#111] border-[#333]",
    icon: "bg-white/10 text-white/60",
    text: "text-white/70",
  },
  warning: {
    wrap: "bg-[#1a1700] border-[#5a5000]/60",
    icon: "bg-[#c0a000]/20 text-[#d4b800]",
    text: "text-[#e8d070]",
  },
};

// ── Provider ───────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ message, type = "success" }) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map((toast) => {
          const s = styles[toast.type] || styles.success;
          return (
            <div
              key={toast.id}
              onClick={() => removeToast(toast.id)}
              className={`
                pointer-events-auto flex items-center gap-3 pl-2 pr-5 py-2 rounded-2xl
                border backdrop-blur-sm cursor-pointer select-none animate-toast-in
                shadow-[0_8px_32px_rgba(0,0,0,0.3)]
                ${s.wrap}
              `}
            >
              <span
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${s.icon}`}
              >
                {icons[toast.type] || icons.success}
              </span>
              <span
                className={`text-[12.5px] font-medium tracking-wide whitespace-nowrap ${s.text}`}
              >
                {toast.message}
              </span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
