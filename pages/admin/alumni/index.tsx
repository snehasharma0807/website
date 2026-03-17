import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import AdminTable from '../../../components/admin/AdminTable';
import TableSkeleton from '../../../components/admin/TableSkeleton';
import AlumniForm from '../../../components/admin/alumni/AlumniForm';
import { ToastContainer, useToast } from '../../../components/admin/Toast';
import {
  getAlumni,
  deleteAlumni,
  type Alumni,
} from '../../../lib/alumni';

/** Format as "Name 'YY" (e.g. "Jane Doe '25") */
function formatNameWithYear(name: string | null, graduationYear: string | null): string {
  const n = (name ?? '').trim() || '—';
  const year = (graduationYear ?? '').trim();
  if (!year) return n;
  const yy = year.length >= 2 ? year.slice(-2) : year;
  return `${n} '${yy}`;
}

const COLUMNS = [
  {
    key: '_nameWithYear',
    label: 'Name',
    render: (row: Record<string, unknown>) =>
      formatNameWithYear(row.name as string | null, row.graduation_year as string | null),
  },
  { key: 'graduation_year', label: 'Graduation Year' },
];

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Alumni | null>(null);
  const { toasts, addToast, dismissToast } = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setAlumni(await getAlumni());
    } catch (e: unknown) {
      addToast((e as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(id: string) {
    const a = alumni.find(x => x.id === id) ?? null;
    setEditing(a);
    setFormOpen(true);
  }

  async function handleDelete(id: string) {
    try {
      await deleteAlumni(id);
      addToast('Alumni deleted.', 'success');
      load();
    } catch (e: unknown) {
      addToast((e as Error).message, 'error');
    }
  }

  function handleSaved() {
    setFormOpen(false);
    addToast(editing ? 'Alumni updated.' : 'Alumni created.', 'success');
    load();
  }

  return (
    <>
      <div style={s.header}>
        <h1 style={s.heading}>Alumni</h1>
        <button style={s.addBtn} onClick={openCreate}>
          + Add Alumni
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={2} />
      ) : (
        <AdminTable
          columns={COLUMNS}
          rows={alumni}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      {formOpen && (
        <AlumniForm
          alumni={editing}
          onSaved={handleSaved}
          onClose={() => setFormOpen(false)}
          onError={msg => addToast(msg, 'error')}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

AlumniPage.getLayout = (page: React.ReactElement) => (
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
