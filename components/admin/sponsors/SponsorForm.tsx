import React, { useEffect, useRef, useState } from 'react';
import {
  createSponsor,
  updateSponsor,
  uploadSponsorLogo,
  type Sponsor,
  type SponsorInput,
} from '../../../lib/sponsors';
import { validateImageFile } from '../../../lib/uploadValidation';

interface Props {
  sponsor: Sponsor | null;
  onSaved: () => void;
  onClose: () => void;
  onError: (msg: string) => void;
}

const EMPTY: SponsorInput = {
  name: '',
  logo_url: '',
  website: '',
  tier: '',
};

export default function SponsorForm({ sponsor, onSaved, onClose, onError }: Props) {
  const [form, setForm] = useState<SponsorInput>(EMPTY);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sponsor) {
      setForm({
        name: sponsor.name ?? '',
        logo_url: sponsor.logo_url ?? '',
        website: sponsor.website ?? '',
        tier: sponsor.tier ?? '',
      });
      setLogoPreview(sponsor.logo_url ?? null);
    } else {
      setForm(EMPTY);
      setLogoPreview(null);
    }
  }, [sponsor]);

  function set<K extends keyof SponsorInput>(key: K, value: SponsorInput[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      onError(validationError);
      return;
    }

    setLogoPreview(URL.createObjectURL(file));

    try {
      setUploading(true);
      const url = await uploadSponsorLogo(file);
      set('logo_url', url);
    } catch (err: unknown) {
      onError((err as Error).message);
      setLogoPreview(form.logo_url || null);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name?.trim()) {
      onError('Name is required.');
      return;
    }

    try {
      setSaving(true);
      if (sponsor) {
        await updateSponsor(sponsor.id, form);
      } else {
        await createSponsor(form);
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
          <h2 style={formStyles.modalTitle}>{sponsor ? 'Edit Sponsor' : 'New Sponsor'}</h2>
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
              placeholder="Sponsor name"
              required
            />
          </label>

          <div style={formStyles.label}>
            <span>Logo</span>
            <div style={formStyles.imageRow}>
              {logoPreview && (
                <img src={logoPreview} alt="Logo preview" style={formStyles.preview} />
              )}
              <button
                type="button"
                style={formStyles.uploadBtn}
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading…' : logoPreview ? 'Change Logo' : 'Upload Logo'}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleLogoChange}
              />
            </div>
          </div>

          <label style={formStyles.label}>
            Website
            <input
              style={formStyles.input}
              value={form.website ?? ''}
              onChange={e => set('website', e.target.value)}
              placeholder="https://…"
            />
          </label>

          <label style={formStyles.label}>
            Tier
            <input
              style={formStyles.input}
              value={form.tier ?? ''}
              onChange={e => set('tier', e.target.value)}
              placeholder="e.g. Gold, Silver, Bronze, Platinum"
            />
          </label>

          <div style={formStyles.footer}>
            <button type="button" style={formStyles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              style={formStyles.saveBtn}
              disabled={saving || uploading}
            >
              {saving ? 'Saving…' : sponsor ? 'Update' : 'Create'}
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
      maxWidth: 520,
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
    modalHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.25rem 1.5rem',
      borderBottom: '1px solid #2e4460',
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
      padding: '1.5rem',
      overflowY: 'auto',
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
    imageRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      flexWrap: 'wrap' as const,
    },
    preview: {
      width: 72,
      height: 72,
      objectFit: 'cover' as const,
      borderRadius: 4,
      border: '1px solid #2e4460',
    },
    uploadBtn: {
      background: 'transparent',
      border: '1px solid #2e5987',
      color: '#80d2c8',
      borderRadius: 4,
      padding: '0.45rem 0.9rem',
      fontSize: '0.85rem',
      cursor: 'pointer',
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
