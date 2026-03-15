import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import AdminTable from '../../../components/admin/AdminTable';
import ProjectForm from '../../../components/admin/projects/ProjectForm';
import { ToastContainer, useToast } from '../../../components/admin/Toast';
import { getProjects, deleteProject, type Project } from '../../../lib/projects';

const COLUMNS = [
  { key: 'title', label: 'Title' },
  { key: 'status', label: 'Status' },
  { key: '_tags', label: 'Tags' },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const { toasts, addToast, dismissToast } = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setProjects(await getProjects());
    } catch (e: unknown) {
      addToast((e as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(id: string) {
    const project = projects.find(p => p.id === id) ?? null;
    setEditing(project);
    setFormOpen(true);
  }

  async function handleDelete(id: string) {
    try {
      await deleteProject(id);
      addToast('Project deleted.', 'success');
      load();
    } catch (e: unknown) {
      addToast((e as Error).message, 'error');
    }
  }

  function handleSaved() {
    setFormOpen(false);
    addToast(editing ? 'Project updated.' : 'Project created.', 'success');
    load();
  }

  // Flatten tags array → readable string for table display
  const rows = projects.map(p => ({
    ...p,
    _tags: p.tags?.join(', ') ?? '',
  }));

  return (
    <>
      <div style={s.header}>
        <h1 style={s.heading}>Projects</h1>
        <button style={s.addBtn} onClick={openCreate}>+ Add Project</button>
      </div>

      {loading ? (
        <p style={s.muted}>Loading…</p>
      ) : (
        <AdminTable
          columns={COLUMNS}
          rows={rows}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      {formOpen && (
        <ProjectForm
          project={editing}
          onSaved={handleSaved}
          onClose={() => setFormOpen(false)}
          onError={msg => addToast(msg, 'error')}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

ProjectsPage.getLayout = (page: React.ReactElement) => (
  <AdminLayout>{page}</AdminLayout>
);

const s: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
  },
  heading: { fontSize: '1.5rem', fontWeight: 700, color: '#e8eaf0' },
  addBtn: {
    background: '#0069ca',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    padding: '0.5rem 1.1rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  muted: { color: '#657788' },
};
