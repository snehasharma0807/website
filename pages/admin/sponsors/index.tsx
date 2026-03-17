import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import AdminTable from '../../../components/admin/AdminTable';
import TableSkeleton from '../../../components/admin/TableSkeleton';
import SponsorForm from '../../../components/admin/sponsors/SponsorForm';
import { ToastContainer, useToast } from '../../../components/admin/Toast';
import {
  getSponsors,
  deleteSponsor,
  type Sponsor,
} from '../../../lib/sponsors';

const COLUMNS = [
  {
    key: 'logo_url',
    label: 'Logo',
    render: (row: Record<string, unknown>) => {
      const url = row.logo_url as string | null | undefined;
      if (!url) return <span style={{ color: '#657788' }}>—</span>;
      return (
        <img
          src={url}
          alt=""
          style={{
            width: 40,
            height: 40,
            objectFit: 'contain',
            borderRadius: 4,
            border: '1px solid #243547',
          }}
        />
      );
    },
  },
  { key: 'name', label: 'Name' },
  { key: 'tier', label: 'Tier' },
  { key: 'website', label: 'Website' },
];

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Sponsor | null>(null);
  const { toasts, addToast, dismissToast } = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setSponsors(await getSponsors());
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
    const sponsor = sponsors.find(s => s.id === id) ?? null;
    setEditing(sponsor);
    setFormOpen(true);
  }

  async function handleDelete(id: string) {
    try {
      await deleteSponsor(id);
      addToast('Sponsor deleted.', 'success');
      load();
    } catch (e: unknown) {
      addToast((e as Error).message, 'error');
    }
  }

  function handleSaved() {
    setFormOpen(false);
    addToast(editing ? 'Sponsor updated.' : 'Sponsor created.', 'success');
    load();
  }

  return (
    <>
      <div style={s.header}>
        <h1 style={s.heading}>Sponsors</h1>
        <button style={s.addBtn} onClick={openCreate}>
          + Add Sponsor
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={4} />
      ) : (
        <AdminTable
          columns={COLUMNS}
          rows={sponsors}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      {formOpen && (
        <SponsorForm
          sponsor={editing}
          onSaved={handleSaved}
          onClose={() => setFormOpen(false)}
          onError={msg => addToast(msg, 'error')}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

SponsorsPage.getLayout = (page: React.ReactElement) => (
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
