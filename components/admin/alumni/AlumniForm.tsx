import React, { useEffect, useState } from 'react';
import {
  createAlumni,
  updateAlumni,
  type Alumni,
  type AlumniInput,
} from '../../../lib/alumni';

interface Props {
  alumni: Alumni | null;
  onSaved: () => void;
  onClose: () => void;
  onError: (msg: string) => void;
}

const EMPTY: AlumniInput = {
  name: '',
  graduation_year: '',
};

export default function AlumniForm({ alumni, onSaved, onClose, onError }: Props) {
  const [form, setForm] = useState<AlumniInput>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (alumni) {
      setForm({
        name: alumni.name ?? '',
        graduation_year: alumni.graduation_year ?? '',
      });
    } else {
      setForm(EMPTY);
    }
  }, [alumni]);

  function set<K extends keyof AlumniInput>(key: K, value: AlumniInput[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name?.trim()) {
      onError('Name is required.');
      return;
    }

    try {
      setSaving(true);
      if (alumni) {
        await updateAlumni(alumni.id, form);
      } else {
        await createAlumni(form);
      }
      onSaved();
    } catch (err: unknown) {
      onError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const formStyles = getStyles();

  return (
    <div
      style={formStyles.overlay}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={formStyles.modal}>
        <div style={formStyles.modalHeader}>
          <h2 style={formStyles.modalTitle}>{alumni ? 'Edit Alumni' : 'New Alumni'}</h2>
          <button style={formStyles.closeBtn} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={formStyles.form}>
          <label style={formStyles.label}>
            Name <span style={formStyles.required}>*</span>
            <input
              style={formStyles.input}
              value={form.name ?? ''}
              onChange={e => set('name', e.target.value)}
              placeholder="Full name"
              required
            />
          </label>

          <label style={formStyles.label}>
            Graduation Year
            <input
              style={formStyles.input}
              value={form.graduation_year ?? ''}
              onChange={e => set('graduation_year', e.target.value)}
              placeholder="e.g. 2025"
            />
          </label>

          <div style={formStyles.footer}>
            <button type="button" style={formStyles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" style={formStyles.saveBtn} disabled={saving}>
              {saving ? 'Saving…' : alumni ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getStyles(): Record<string, React.CSSProperties> {
  return {
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    },
    modal: {
      background: '#1f2d3d',
      border: '1px solid #2e4460',
      borderRadius: 8,
      width: '100%',
      maxWidth: 400,
      padding: '1.5rem',
    },
    modalHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '1rem',
    },
    modalTitle: { fontSize: '1.15rem', fontWeight: 700, color: '#e8eaf0' },
    closeBtn: {
      background: 'transparent',
      border: 'none',
      color: '#9aafc0',
      fontSize: '1.5rem',
      lineHeight: 1,
      cursor: 'pointer',
      padding: 0,
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    label: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.35rem',
      fontSize: '0.85rem',
      color: '#9aafc0',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.4px',
    },
    required: { color: '#f2594b' },
    input: {
      background: '#172a3a',
      border: '1px solid #2e4460',
      borderRadius: 4,
      color: '#e8eaf0',
      fontSize: '0.9rem',
      padding: '0.55rem 0.75rem',
      outline: 'none',
      fontFamily: 'inherit',
      width: '100%',
    },
    footer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem',
      paddingTop: '0.5rem',
    },
    cancelBtn: {
      background: 'transparent',
      border: '1px solid #657788',
      color: '#9aafc0',
      borderRadius: 4,
      padding: '0.55rem 1.1rem',
      cursor: 'pointer',
      fontSize: '0.9rem',
    },
    saveBtn: {
      background: '#0069ca',
      color: '#fff',
      border: 'none',
      borderRadius: 4,
      padding: '0.55rem 1.4rem',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: 600,
    },
  };
}
