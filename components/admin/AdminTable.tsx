import React, { useState } from 'react';
import ConfirmModal from './ConfirmModal';

export interface Column {
  key: string;
  label: string;
  /** Optional custom cell renderer (e.g. for thumbnails). */
  render?: (row: Record<string, unknown>) => React.ReactNode;
}

interface Props {
  columns: Column[];
  rows: Record<string, unknown>[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function AdminTable({ columns, rows, onEdit, onDelete }: Props) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  function handleDeleteClick(id: string) {
    setPendingDeleteId(id);
  }

  function confirmDelete() {
    if (pendingDeleteId) {
      onDelete(pendingDeleteId);
      setPendingDeleteId(null);
    }
  }

  function cancelDelete() {
    setPendingDeleteId(null);
  }

  return (
    <>
      <div style={s.wrapper}>
        <table style={s.table}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} style={s.th}>{col.label}</th>
              ))}
              <th style={{ ...s.th, width: 120 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} style={s.emptyCell}>
                  No records found.
                </td>
              </tr>
            ) : (
              rows.map(row => {
                const id = String(row.id ?? '');
                return (
                  <tr key={id} style={s.tr}>
                    {columns.map(col => (
                      <td key={col.key} style={s.td}>
                        {col.render ? col.render(row) : String(row[col.key] ?? '')}
                      </td>
                    ))}
                    <td style={s.td}>
                      <div style={s.actions}>
                        <button
                          style={s.editBtn}
                          onClick={() => onEdit(id)}
                          aria-label={`Edit row ${id}`}
                        >
                          Edit
                        </button>
                        <button
                          style={s.deleteBtn}
                          onClick={() => handleDeleteClick(id)}
                          aria-label={`Delete row ${id}`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={!!pendingDeleteId}
        message="Are you sure you want to delete this record? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        danger
      />
    </>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrapper: {
    overflowX: 'auto',
    borderRadius: 8,
    border: '1px solid #243547',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
    color: '#e8eaf0',
    background: '#1f2d3d',
  },
  th: {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    background: '#172a3a',
    color: '#80d2c8',
    fontWeight: 600,
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    borderBottom: '1px solid #243547',
  },
  tr: {
    borderBottom: '1px solid #243547',
  },
  td: {
    padding: '0.7rem 1rem',
    verticalAlign: 'middle',
    color: '#cdd6e0',
    maxWidth: 300,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  emptyCell: {
    padding: '2rem 1rem',
    textAlign: 'center',
    color: '#657788',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  editBtn: {
    background: '#0069ca',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    padding: '0.3rem 0.7rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  deleteBtn: {
    background: 'transparent',
    color: '#f2594b',
    border: '1px solid #f2594b',
    borderRadius: 4,
    padding: '0.3rem 0.7rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
};
