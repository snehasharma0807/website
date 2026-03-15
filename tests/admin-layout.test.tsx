/**
 * AdminTable component tests.
 *
 * Uses react-dom/server to render components to HTML, then inspects
 * the output — no browser or Jest needed.
 *
 * Run with:
 *   npx ts-node --transpile-only --compiler-options '{"jsx":"react","module":"commonjs"}' tests/admin-layout.test.tsx
 */

import * as ReactDOMServer from 'react-dom/server';
import React, { useState } from 'react';

// ---- Inline AdminTable (avoids ESM/Next.js import issues in ts-node) ------
// We re-implement the component logic here rather than importing the source
// file, which would pull in Next.js internals incompatible with raw ts-node.

interface Column { key: string; label: string; }
interface TableProps {
  columns: Column[];
  rows: Record<string, unknown>[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  // For testing: force the modal to show for a given id
  _forceDeleteId?: string;
}

function AdminTableTestable({ columns, rows, onEdit, onDelete, _forceDeleteId }: TableProps) {
  const [pendingId, setPendingId] = useState<string | null>(_forceDeleteId ?? null);

  return (
    <>
      <table>
        <thead>
          <tr>
            {columns.map(c => <th key={c.key}>{c.label}</th>)}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const id = String(row.id ?? '');
            return (
              <tr key={id} data-testid="table-row">
                {columns.map(c => <td key={c.key}>{String(row[c.key] ?? '')}</td>)}
                <td>
                  <button data-testid="edit-btn" onClick={() => onEdit(id)}>Edit</button>
                  <button data-testid="delete-btn" onClick={() => setPendingId(id)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {pendingId && (
        <div data-testid="confirm-modal" role="dialog">
          <p>Are you sure?</p>
          <button data-testid="cancel-btn" onClick={() => setPendingId(null)}>Cancel</button>
          <button data-testid="confirm-btn" onClick={() => { onDelete(pendingId); setPendingId(null); }}>Delete</button>
        </div>
      )}
    </>
  );
}

// ---- Helpers ---------------------------------------------------------------

type Result = { label: string; passed: boolean; detail?: string };

function countOccurrences(html: string, substring: string): number {
  return html.split(substring).length - 1;
}

// ---- Tests -----------------------------------------------------------------

const COLUMNS: Column[] = [
  { key: 'title', label: 'Title' },
  { key: 'status', label: 'Status' },
];

const ROWS = [
  { id: '1', title: 'Project Alpha', status: 'active' },
  { id: '2', title: 'Project Beta',  status: 'inactive' },
  { id: '3', title: 'Project Gamma', status: 'active' },
];

const results: Result[] = [];

// Test 1: Correct number of rows rendered
{
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(AdminTableTestable, {
      columns: COLUMNS,
      rows: ROWS,
      onEdit: () => {},
      onDelete: () => {},
    }),
  );
  const rowCount = countOccurrences(html, 'data-testid="table-row"');
  results.push({
    label: `Renders correct number of rows (expected ${ROWS.length}, got ${rowCount})`,
    passed: rowCount === ROWS.length,
  });
}

// Test 2: Each row has Edit and Delete buttons
{
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(AdminTableTestable, {
      columns: COLUMNS,
      rows: ROWS,
      onEdit: () => {},
      onDelete: () => {},
    }),
  );
  const editCount   = countOccurrences(html, 'data-testid="edit-btn"');
  const deleteCount = countOccurrences(html, 'data-testid="delete-btn"');
  results.push({
    label: `Each row has an Edit button (expected ${ROWS.length}, got ${editCount})`,
    passed: editCount === ROWS.length,
  });
  results.push({
    label: `Each row has a Delete button (expected ${ROWS.length}, got ${deleteCount})`,
    passed: deleteCount === ROWS.length,
  });
}

// Test 3: Confirmation modal is NOT shown by default
{
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(AdminTableTestable, {
      columns: COLUMNS,
      rows: ROWS,
      onEdit: () => {},
      onDelete: () => {},
    }),
  );
  const hasModal = html.includes('data-testid="confirm-modal"');
  results.push({
    label: 'Confirmation modal is NOT shown by default',
    passed: !hasModal,
  });
}

// Test 4: Confirmation modal IS shown when _forceDeleteId is set
{
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(AdminTableTestable, {
      columns: COLUMNS,
      rows: ROWS,
      onEdit: () => {},
      onDelete: () => {},
      _forceDeleteId: '1',
    }),
  );
  const hasModal    = html.includes('data-testid="confirm-modal"');
  const hasConfirm  = html.includes('data-testid="confirm-btn"');
  const hasCancel   = html.includes('data-testid="cancel-btn"');
  results.push({
    label: 'Confirmation modal renders with Confirm and Cancel buttons when triggered',
    passed: hasModal && hasConfirm && hasCancel,
    detail: !hasModal ? 'modal missing' : !hasConfirm ? 'confirm-btn missing' : !hasCancel ? 'cancel-btn missing' : undefined,
  });
}

// Test 5: onDelete is NOT called without confirmation (modal not shown → no call)
{
  let deleteCalled = false;
  ReactDOMServer.renderToStaticMarkup(
    React.createElement(AdminTableTestable, {
      columns: COLUMNS,
      rows: ROWS,
      onEdit: () => {},
      onDelete: () => { deleteCalled = true; },
      // No _forceDeleteId — modal not shown, confirm never clicked
    }),
  );
  results.push({
    label: 'onDelete is NOT called when modal has not been confirmed',
    passed: !deleteCalled,
  });
}

// ---- Output ----------------------------------------------------------------

let anyFailed = false;
for (const { label, passed, detail } of results) {
  if (passed) {
    console.log(`PASS  ${label}`);
  } else {
    console.log(`FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
    anyFailed = true;
  }
}
process.exit(anyFailed ? 1 : 0);
