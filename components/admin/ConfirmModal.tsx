import React from 'react';

interface Props {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#1f2d3d',
    border: '1px solid #243547',
    borderRadius: 8,
    padding: '2rem',
    maxWidth: 400,
    width: '90%',
  },
  title: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#e8eaf0',
    marginBottom: '0.75rem',
  },
  message: {
    color: '#e8eaf0',
    marginBottom: '1.5rem',
    lineHeight: 1.5,
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    background: 'transparent',
    border: '1px solid #657788',
    color: '#9aafc0',
    borderRadius: 4,
    padding: '0.5rem 1rem',
    cursor: 'pointer',
  },
  confirmBtn: {
    background: '#f2594b',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    padding: '0.5rem 1rem',
    cursor: 'pointer',
  },
  confirmBtnDefault: {
    background: '#0069ca',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    padding: '0.5rem 1rem',
    cursor: 'pointer',
  },
};

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = true,
}: Props) {
  if (!open) return null;

  return (
    <div style={s.overlay} role="dialog" aria-modal="true" aria-label={title ?? 'Confirm'}>
      <div style={s.modal}>
        {title && <p style={s.title}>{title}</p>}
        <p style={s.message}>{message}</p>
        <div style={s.actions}>
          <button style={s.cancelBtn} onClick={onCancel} type="button">
            {cancelLabel}
          </button>
          <button
            style={danger ? s.confirmBtn : s.confirmBtnDefault}
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
