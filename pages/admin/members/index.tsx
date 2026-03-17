import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import AdminTable from '../../../components/admin/AdminTable';
import TableSkeleton from '../../../components/admin/TableSkeleton';
import MemberForm from '../../../components/admin/members/MemberForm';
import { ToastContainer, useToast } from '../../../components/admin/Toast';
import {
  getMembers,
  deleteMember,
  type Member,
} from '../../../lib/members';

const COLUMNS = [
  {
    key: 'photo_url',
    label: 'Photo',
    render: (row: Record<string, unknown>) => {
      const url = row.photo_url as string | null | undefined;
      if (!url) return <span style={{ color: '#657788' }}>—</span>;
      return (
        <img
          src={url}
          alt=""
          style={{
            width: 40,
            height: 40,
            objectFit: 'cover',
            borderRadius: 4,
            border: '1px solid #243547',
          }}
        />
      );
    },
  },
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'graduation_year', label: 'Graduation Year' },
];

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const { toasts, addToast, dismissToast } = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setMembers(await getMembers());
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
    const member = members.find(m => m.id === id) ?? null;
    setEditing(member);
    setFormOpen(true);
  }

  async function handleDelete(id: string) {
    try {
      await deleteMember(id);
      addToast('Member deleted.', 'success');
      load();
    } catch (e: unknown) {
      addToast((e as Error).message, 'error');
    }
  }

  function handleSaved() {
    setFormOpen(false);
    addToast(editing ? 'Member updated.' : 'Member created.', 'success');
    load();
  }

  return (
    <>
      <div style={s.header}>
        <h1 style={s.heading}>Members</h1>
        <button style={s.addBtn} onClick={openCreate}>
          + Add Member
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={4} />
      ) : (
        <AdminTable
          columns={COLUMNS}
          rows={members}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      {formOpen && (
        <MemberForm
          member={editing}
          onSaved={handleSaved}
          onClose={() => setFormOpen(false)}
          onError={msg => addToast(msg, 'error')}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

MembersPage.getLayout = (page: React.ReactElement) => (
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
