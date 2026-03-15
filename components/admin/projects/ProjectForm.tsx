import React, { useEffect, useRef, useState } from 'react';
import { createProject, updateProject, uploadProjectImage, type Project, type ProjectInput } from '../../../lib/projects';

interface Props {
  project: Project | null;   // null = create mode
  onSaved: () => void;
  onClose: () => void;
  onError: (msg: string) => void;
}

const EMPTY: ProjectInput = {
  title: '',
  description: '',
  image_url: '',
  github_link: '',
  demo_link: '',
  dev_team: '',
  tags: [],
  status: 'active',
};

export default function ProjectForm({ project, onSaved, onClose, onError }: Props) {
  const [form, setForm] = useState<ProjectInput>(EMPTY);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Pre-fill when editing
  useEffect(() => {
    if (project) {
      setForm({
        title: project.title ?? '',
        description: project.description ?? '',
        image_url: project.image_url ?? '',
        github_link: project.github_link ?? '',
        demo_link: project.demo_link ?? '',
        dev_team: project.dev_team ?? '',
        tags: project.tags ?? [],
        status: project.status ?? 'active',
      });
      setImagePreview(project.image_url ?? null);
    } else {
      setForm(EMPTY);
      setImagePreview(null);
    }
  }, [project]);

  function set<K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    setImagePreview(URL.createObjectURL(file));

    try {
      setUploading(true);
      const url = await uploadProjectImage(file);
      set('image_url', url);
    } catch (err: unknown) {
      onError((err as Error).message);
      setImagePreview(form.image_url || null);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title?.trim()) {
      onError('Title is required.');
      return;
    }

    try {
      setSaving(true);
      if (project) {
        await updateProject(project.id, form);
      } else {
        await createProject(form);
      }
      onSaved();
    } catch (err: unknown) {
      onError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={s.modal}>
        <div style={s.modalHeader}>
          <h2 style={s.modalTitle}>{project ? 'Edit Project' : 'New Project'}</h2>
          <button style={s.closeBtn} onClick={onClose} aria-label="Close">×</button>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          {/* Title */}
          <label style={s.label}>
            Title <span style={s.required}>*</span>
            <input
              style={s.input}
              value={form.title ?? ''}
              onChange={e => set('title', e.target.value)}
              placeholder="Project name"
              required
            />
          </label>

          {/* Description */}
          <label style={s.label}>
            Description
            <textarea
              style={{ ...s.input, ...s.textarea }}
              value={form.description ?? ''}
              onChange={e => set('description', e.target.value)}
              placeholder="Short project description"
              rows={3}
            />
          </label>

          {/* Image upload */}
          <div style={s.label}>
            <span>Project Image</span>
            <div style={s.imageRow}>
              {imagePreview && (
                <img src={imagePreview} alt="Preview" style={s.preview} />
              )}
              <button
                type="button"
                style={s.uploadBtn}
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading…' : imagePreview ? 'Change Image' : 'Upload Image'}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* Two-column row */}
          <div style={s.row}>
            <label style={{ ...s.label, flex: 1 }}>
              GitHub Link
              <input
                style={s.input}
                value={form.github_link ?? ''}
                onChange={e => set('github_link', e.target.value)}
                placeholder="https://github.com/…"
              />
            </label>
            <label style={{ ...s.label, flex: 1 }}>
              Demo Link
              <input
                style={s.input}
                value={form.demo_link ?? ''}
                onChange={e => set('demo_link', e.target.value)}
                placeholder="https://…"
              />
            </label>
          </div>

          {/* Dev team */}
          <label style={s.label}>
            Dev Team
            <input
              style={s.input}
              value={form.dev_team ?? ''}
              onChange={e => set('dev_team', e.target.value)}
              placeholder="Names or team identifier"
            />
          </label>

          {/* Tags */}
          <label style={s.label}>
            Tags <span style={s.hint}>(comma-separated)</span>
            <input
              style={s.input}
              value={form.tags?.join(', ') ?? ''}
              onChange={e =>
                set('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))
              }
              placeholder="react, node, mongodb"
            />
          </label>

          {/* Status */}
          <label style={s.label}>
            Status
            <select
              style={{ ...s.input, ...s.select }}
              value={form.status ?? 'active'}
              onChange={e => set('status', e.target.value as 'active' | 'archived')}
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </label>

          <div style={s.footer}>
            <button type="button" style={s.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" style={s.saveBtn} disabled={saving || uploading}>
              {saving ? 'Saving…' : project ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
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
    maxWidth: 620,
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
  hint: { color: '#657788', fontWeight: 400, textTransform: 'none', letterSpacing: 0 },
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
  select: { cursor: 'pointer' },
  row: { display: 'flex', gap: '1rem' },
  imageRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' as const },
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
