import React from 'react';

interface Props {
  rows?: number;
  cols?: number;
}

const s: Record<string, React.CSSProperties> = {
  wrapper: {
    overflowX: 'auto',
    borderRadius: 8,
    border: '1px solid #243547',
    background: '#1f2d3d',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  th: {
    padding: '0.75rem 1rem',
    textAlign: 'left' as const,
    background: '#172a3a',
    borderBottom: '1px solid #243547',
  },
  td: {
    padding: '0.7rem 1rem',
    borderBottom: '1px solid #243547',
  },
  skeleton: {
    height: 20,
    borderRadius: 4,
    backgroundColor: '#243547',
  },
};

export default function TableSkeleton({ rows = 5, cols = 4 }: Props) {
  return (
    <>
      <div style={s.wrapper}>
        <table style={s.table}>
          <thead>
            <tr>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} style={s.th}>
                  <div style={{ ...s.skeleton, width: i === 0 ? 80 : 120 }} />
                </th>
              ))}
              <th style={{ ...s.th, width: 120 }}>
                <div style={{ ...s.skeleton, width: 60 }} />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr key={rowIdx}>
                {Array.from({ length: cols + 1 }).map((_, colIdx) => (
                  <td key={colIdx} style={s.td}>
                    <div
                      style={{
                        ...s.skeleton,
                        width: colIdx === 0 ? 40 : colIdx === cols ? 70 : 100,
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
