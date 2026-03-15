import React, { useEffect, useRef } from 'react';

export type ToastType = 'success' | 'error';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
  /** Auto-dismiss after ms. Default 4000. Pass 0 to disable. */
  duration?: number;
}

function ToastItem({ toast, onDismiss, duration = 4000 }: ToastItemProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (duration > 0) {
      timerRef.current = setTimeout(() => onDismiss(toast.id), duration);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, duration, onDismiss]);

  const bg = toast.type === 'success' ? '#1a3d2b' : '#3d1a1a';
  const border = toast.type === 'success' ? '#2ecc71' : '#f2594b';
  const icon = toast.type === 'success' ? '✓' : '✕';

  return (
    <div
      role="alert"
      style={{ ...s.toast, background: bg, borderLeftColor: border }}
    >
      <span style={{ ...s.icon, color: border }}>{icon}</span>
      <span style={s.message}>{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        style={s.close}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
  duration?: number;
}

/** Drop this once in your admin layout or page to render active toasts. */
export function ToastContainer({ toasts, onDismiss, duration }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div style={s.container} aria-live="polite">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} duration={duration} />
      ))}
    </div>
  );
}

/** Hook to manage toast state. */
export function useToast() {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  function addToast(message: string, type: ToastType = 'success') {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, message }]);
  }

  function dismissToast(id: string) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  return { toasts, addToast, dismissToast };
}

const s: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    bottom: '1.5rem',
    right: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    zIndex: 2000,
    maxWidth: 360,
    width: '90vw',
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: 6,
    borderLeft: '4px solid',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    color: '#e8eaf0',
    fontSize: '0.9rem',
    animation: 'fadeInUp 0.2s ease',
  },
  icon: {
    fontWeight: 700,
    fontSize: '1rem',
    flexShrink: 0,
  },
  message: {
    flex: 1,
    lineHeight: 1.4,
  },
  close: {
    background: 'transparent',
    border: 'none',
    color: '#9aafc0',
    fontSize: '1.2rem',
    lineHeight: 1,
    cursor: 'pointer',
    flexShrink: 0,
    padding: 0,
  },
};
