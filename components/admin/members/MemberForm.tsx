import React, { useEffect, useRef, useState } from 'react';
import {
  createMember,
  updateMember,
  uploadMemberPhoto,
  type Member,
  type MemberInput,
} from '../../../lib/members';
import { validateImageFile } from '../../../lib/uploadValidation';

interface Props {
  member: Member | null; // null = create mode
  onSaved: () => void;
  onClose: () => void;
  onError: (msg: string) => void;
}

const EMPTY: MemberInput = {
  name: '',
  role: '',
  bio: '',
  photo_url: '',
  linkedin: '',
  github: '',
  graduation_year: '',
};

export default function MemberForm({ member, onSaved, onClose, onError }: Props) {
  const [form, setForm] = useState<MemberInput>(EMPTY);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (member) {
      setForm({
        name: member.name ?? '',
        role: member.role ?? '',
        bio: member.bio ?? '',
        photo_url: member.photo_url ?? '',
        linkedin: member.linkedin ?? '',
        github: member.github ?? '',
        graduation_year: member.graduation_year ?? '',
      });
      setPhotoPreview(member.photo_url ?? null);
    } else {
      setForm(EMPTY);
      setPhotoPreview(null);
    }
  }, [member]);

  function set<K extends keyof MemberInput>(key: K, value: MemberInput[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      onError(validationError);
      return;
    }

    setPhotoPreview(URL.createObjectURL(file));

    try {
      setUploading(true);
      const url = await uploadMemberPhoto(file);
      set('photo_url', url);
    } catch (err: unknown) {
      onError((err as Error).message);
      setPhotoPreview(form.photo_url || null);
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
      if (member) {
        await updateMember(member.id, form);
      } else {
        await createMember(form);
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
          <h2 style={formStyles.modalTitle}>{member ? 'Edit Member' : 'New Member'}</h2>
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
            Role
            <input
              style={formStyles.input}
              value={form.role ?? ''}
              onChange={e => set('role', e.target.value)}
              placeholder="e.g. Director, Developer"
            />
          </label>

          <label style={formStyles.label}>
            Bio
            <textarea
              style={{ ...formStyles.input, ...formStyles.textarea }}
              value={form.bio ?? ''}
              onChange={e => set('bio', e.target.value)}
              placeholder="Short bio"
              rows={3}
            />
          </label>

          <div style={formStyles.label}>
            <span>Photo</span>
            <div style={formStyles.imageRow}>
              {photoPreview && (
                <img src={photoPreview} alt="Preview" style={formStyles.preview} />
              )}
              <button
                type="button"
                style={formStyles.uploadBtn}
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading…' : photoPreview ? 'Change Photo' : 'Upload Photo'}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoChange}
              />
            </div>
          </div>

          <label style={formStyles.label}>
            LinkedIn
            <input
              style={formStyles.input}
              value={form.linkedin ?? ''}
              onChange={e => set('linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/…"
            />
          </label>

          <label style={formStyles.label}>
            GitHub
            <input
              style={formStyles.input}
              value={form.github ?? ''}
              onChange={e => set('github', e.target.value)}
              placeholder="https://github.com/…"
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
            <button
              type="submit"
              style={formStyles.saveBtn}
              disabled={saving || uploading}
            >
              {saving ? 'Saving…' : member ? 'Update' : 'Create'}
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
    textarea: { resize: 'vertical' as const },
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
