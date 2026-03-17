import React, { useEffect, useRef, useState } from 'react';
import {
  createProject,
  updateProject,
  uploadProjectImage,
  type Project,
  type ProjectInput,
  type ProjectFeature,
  type ProjectTeamMember,
  type ProjectTestimonial,
} from '../../../lib/projects';
import { validateImageFile } from '../../../lib/uploadValidation';

interface Props {
  project: Project | null;   // null = create mode
  onSaved: () => void;
  onClose: () => void;
  onError: (msg: string) => void;
}

const emptyFeature = (): ProjectFeature => ({ header: '', body: '', image_url: '' });
const emptyTeamMember = (): ProjectTeamMember => ({
  name: '', title: '', image_url: '', linkedin: '', role: 'developer',
});
const emptyTestimonial = (): ProjectTestimonial => ({ author: '', quote: '' });

const EMPTY: ProjectInput = {
  title: '',
  title_abbrev: '',
  description: '',
  image_url: '',
  github_link: '',
  demo_link: '',
  dev_team: '',
  tags: [],
  status: 'active',
  semester: '',
  about_project: '',
  about_client: '',
  impact: '',
  features: [],
  team_members: [],
  testimonials: [],
};

export default function ProjectForm({ project, onSaved, onClose, onError }: Props) {
  const [form, setForm] = useState<ProjectInput>(EMPTY);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const featureImageRef = useRef<HTMLInputElement>(null);
  const teamImageRef = useRef<HTMLInputElement>(null);
  const featureImageIndexRef = useRef<number>(0);
  const teamImageIndexRef = useRef<number>(0);
  const [uploadingFeatureIndex, setUploadingFeatureIndex] = useState<number | null>(null);
  const [uploadingTeamIndex, setUploadingTeamIndex] = useState<number | null>(null);

  // Pre-fill when editing
  useEffect(() => {
    if (project) {
      setForm({
        title: project.title ?? '',
        title_abbrev: project.title_abbrev ?? '',
        description: project.description ?? '',
        image_url: project.image_url ?? '',
        github_link: project.github_link ?? '',
        demo_link: project.demo_link ?? '',
        dev_team: project.dev_team ?? '',
        tags: project.tags ?? [],
        status: project.status ?? 'active',
        semester: project.semester ?? '',
        about_project: project.about_project ?? '',
        about_client: project.about_client ?? '',
        impact: project.impact ?? '',
        features: project.features ?? [],
        team_members: project.team_members ?? [],
        testimonials: project.testimonials ?? [],
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
    e.target.value = '';

    const validationError = validateImageFile(file);
    if (validationError) {
      onError(validationError);
      return;
    }

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

  async function handleFeatureImageChange(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const validationError = validateImageFile(file);
    if (validationError) {
      onError(validationError);
      setUploadingFeatureIndex(null);
      return;
    }

    try {
      setUploadingFeatureIndex(index);
      const url = await uploadProjectImage(file);
      setForm((prev) => {
        const features = [...(prev.features ?? [])];
        if (features[index]) features[index] = { ...features[index], image_url: url };
        return { ...prev, features };
      });
    } catch (err: unknown) {
      onError((err as Error).message);
    } finally {
      setUploadingFeatureIndex(null);
    }
  }

  async function handleTeamImageChange(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const validationError = validateImageFile(file);
    if (validationError) {
      onError(validationError);
      setUploadingTeamIndex(null);
      return;
    }

    try {
      setUploadingTeamIndex(index);
      const url = await uploadProjectImage(file);
      setForm((prev) => {
        const team_members = [...(prev.team_members ?? [])];
        if (team_members[index]) team_members[index] = { ...team_members[index], image_url: url };
        return { ...prev, team_members };
      });
    } catch (err: unknown) {
      onError((err as Error).message);
    } finally {
      setUploadingTeamIndex(null);
    }
  }

  function setFeature(index: number, patch: Partial<ProjectFeature>) {
    setForm((prev) => {
      const features = [...(prev.features ?? [])];
      if (features[index]) features[index] = { ...features[index], ...patch };
      return { ...prev, features };
    });
  }

  function setTeamMember(index: number, patch: Partial<ProjectTeamMember>) {
    setForm((prev) => {
      const team_members = [...(prev.team_members ?? [])];
      if (team_members[index]) team_members[index] = { ...team_members[index], ...patch };
      return { ...prev, team_members };
    });
  }

  function setTestimonial(index: number, patch: Partial<ProjectTestimonial>) {
    setForm((prev) => {
      const testimonials = [...(prev.testimonials ?? [])];
      if (testimonials[index]) testimonials[index] = { ...testimonials[index], ...patch };
      return { ...prev, testimonials };
    });
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
          <div style={s.sectionTitle}>Basics</div>
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
          <label style={s.label}>
            Title abbreviation
            <input
              style={s.input}
              value={form.title_abbrev ?? ''}
              onChange={e => set('title_abbrev', e.target.value)}
              placeholder="e.g. GOGO for Guitars Over Guns (GOGO)"
            />
          </label>

          <label style={s.label}>
            Description (intro)
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
              <input
                ref={featureImageRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => handleFeatureImageChange(e, featureImageIndexRef.current)}
              />
              <input
                ref={teamImageRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => handleTeamImageChange(e, teamImageIndexRef.current)}
              />
            </div>
          </div>

          <div style={s.sectionTitle}>About</div>
          <label style={s.label}>
            About the Project
            <textarea
              style={{ ...s.input, ...s.textarea }}
              value={form.about_project ?? ''}
              onChange={e => set('about_project', e.target.value)}
              placeholder="Detailed description of the project"
              rows={4}
            />
          </label>
          <label style={s.label}>
            About the Client
            <textarea
              style={{ ...s.input, ...s.textarea }}
              value={form.about_client ?? ''}
              onChange={e => set('about_client', e.target.value)}
              placeholder="Who the client is and their mission"
              rows={3}
            />
          </label>
          <label style={s.label}>
            Impact
            <textarea
              style={{ ...s.input, ...s.textarea }}
              value={form.impact ?? ''}
              onChange={e => set('impact', e.target.value)}
              placeholder="Outcomes and impact of the project"
              rows={3}
            />
          </label>

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

          <div style={s.sectionTitle}>Main features</div>
          {(form.features ?? []).map((feat, i) => (
            <div key={i} style={s.card}>
              <div style={s.cardHeader}>
                <span>Feature {i + 1}</span>
                <button type="button" style={s.removeBtn} onClick={() => setForm(prev => ({ ...prev, features: (prev.features ?? []).filter((_, j) => j !== i) }))}>Remove</button>
              </div>
              <input style={s.input} value={feat.header} onChange={e => setFeature(i, { header: e.target.value })} placeholder="Header" />
              <textarea style={{ ...s.input, ...s.textarea }} value={feat.body} onChange={e => setFeature(i, { body: e.target.value })} placeholder="Body" rows={2} />
              <div style={s.imageRow}>
                {feat.image_url && <img src={feat.image_url} alt="" style={s.preview} />}
                <button type="button" style={s.uploadBtn} disabled={uploadingFeatureIndex !== null} onClick={() => { featureImageIndexRef.current = i; setUploadingFeatureIndex(i); featureImageRef.current?.click(); }}>
                  {uploadingFeatureIndex === i ? 'Uploading…' : feat.image_url ? 'Change image' : 'Upload image'}
                </button>
              </div>
            </div>
          ))}
          <button type="button" style={s.addBtn} onClick={() => setForm(prev => ({ ...prev, features: [...(prev.features ?? []), emptyFeature()] }))}>
            + Add feature
          </button>

          <div style={s.sectionTitle}>Team</div>
          {(form.team_members ?? []).map((mem, i) => (
            <div key={i} style={s.card}>
              <div style={s.cardHeader}>
                <span>Member {i + 1}</span>
                <button type="button" style={s.removeBtn} onClick={() => setForm(prev => ({ ...prev, team_members: (prev.team_members ?? []).filter((_, j) => j !== i) }))}>Remove</button>
              </div>
              <div style={s.row}>
                <input style={{ ...s.input, flex: 1 }} value={mem.name} onChange={e => setTeamMember(i, { name: e.target.value })} placeholder="Name" />
                <input style={{ ...s.input, flex: 1 }} value={mem.title} onChange={e => setTeamMember(i, { title: e.target.value })} placeholder="Title" />
              </div>
              <label style={s.label}>
                Role
                <select style={{ ...s.input, ...s.select }} value={mem.role} onChange={e => setTeamMember(i, { role: e.target.value as 'lead' | 'developer' })}>
                  <option value="lead">Lead</option>
                  <option value="developer">Developer</option>
                </select>
              </label>
              <input style={s.input} value={mem.linkedin} onChange={e => setTeamMember(i, { linkedin: e.target.value })} placeholder="LinkedIn URL" />
              <div style={s.imageRow}>
                {mem.image_url && <img src={mem.image_url} alt="" style={s.preview} />}
                <button type="button" style={s.uploadBtn} disabled={uploadingTeamIndex !== null} onClick={() => { teamImageIndexRef.current = i; setUploadingTeamIndex(i); teamImageRef.current?.click(); }}>
                  {uploadingTeamIndex === i ? 'Uploading…' : mem.image_url ? 'Change photo' : 'Upload photo'}
                </button>
              </div>
            </div>
          ))}
          <button type="button" style={s.addBtn} onClick={() => setForm(prev => ({ ...prev, team_members: [...(prev.team_members ?? []), emptyTeamMember()] }))}>
            + Add team member
          </button>

          <div style={s.sectionTitle}>Testimonials</div>
          {(form.testimonials ?? []).map((t, i) => (
            <div key={i} style={s.card}>
              <div style={s.cardHeader}>
                <span>Testimonial {i + 1}</span>
                <button type="button" style={s.removeBtn} onClick={() => setForm(prev => ({ ...prev, testimonials: (prev.testimonials ?? []).filter((_, j) => j !== i) }))}>Remove</button>
              </div>
              <input style={s.input} value={t.author} onChange={e => setTestimonial(i, { author: e.target.value })} placeholder="Author" />
              <textarea style={{ ...s.input, ...s.textarea }} value={t.quote} onChange={e => setTestimonial(i, { quote: e.target.value })} placeholder="Quote" rows={3} />
            </div>
          ))}
          <button type="button" style={s.addBtn} onClick={() => setForm(prev => ({ ...prev, testimonials: [...(prev.testimonials ?? []), emptyTestimonial()] }))}>
            + Add testimonial
          </button>

          {/* Semester / cohort for grouping (e.g. Fall 2025, Spring 2026) */}
          <label style={s.label}>
            Semester
            <input
              style={s.input}
              value={form.semester ?? ''}
              onChange={e => set('semester', e.target.value)}
              placeholder="e.g. Fall 2025, Spring 2026"
            />
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
  sectionTitle: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#80d2c8',
    marginTop: '0.5rem',
    marginBottom: '0.25rem',
    paddingBottom: '0.25rem',
    borderBottom: '1px solid #2e4460',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '0.75rem',
    background: '#172a3a',
    border: '1px solid #2e4460',
    borderRadius: 6,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.8rem',
    color: '#9aafc0',
  },
  removeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#f2594b',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  addBtn: {
    background: 'transparent',
    border: '1px dashed #2e5987',
    color: '#80d2c8',
    borderRadius: 4,
    padding: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
};
