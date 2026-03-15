import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import type { NextPageWithLayout } from '../../types/next';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const TABLES = ['projects', 'members', 'sponsors', 'alumni'] as const;
type TableName = (typeof TABLES)[number];

const CARD_META: Record<TableName, { label: string; color: string }> = {
  projects: { label: 'Projects', color: '#0069ca' },
  members:  { label: 'Members',  color: '#80d2c8' },
  sponsors: { label: 'Sponsors', color: '#2e5987' },
  alumni:   { label: 'Alumni',   color: '#f2594b' },
};

type Counts = Record<TableName, number | null>;

export default function AdminOverview() {
  const [email, setEmail] = useState('');
  const [counts, setCounts] = useState<Counts>({
    projects: null, members: null, sponsors: null, alumni: null,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email ?? '');
    });

    async function fetchCounts() {
      const results = await Promise.all(
        TABLES.map(t =>
          supabase.from(t).select('id', { count: 'exact', head: true }),
        ),
      );
      const next: Counts = { projects: null, members: null, sponsors: null, alumni: null };
      TABLES.forEach((t, i) => {
        next[t] = results[i].count ?? 0;
      });
      setCounts(next);
    }
    fetchCounts();
  }, []);

  return (
    <div>
      <h1 style={s.heading}>Welcome back{email ? `, ${email.split('@')[0]}` : ''}!</h1>
      <p style={s.sub}>Here&apos;s a snapshot of your site content.</p>

      <div style={s.grid}>
        {TABLES.map(t => (
          <div key={t} style={{ ...s.card, borderTopColor: CARD_META[t].color }}>
            <span style={{ ...s.count, color: CARD_META[t].color }}>
              {counts[t] === null ? '—' : counts[t]}
            </span>
            <span style={s.cardLabel}>{CARD_META[t].label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

AdminOverview.getLayout = (page: React.ReactElement) => (
  <AdminLayout>{page}</AdminLayout>
);

const s: Record<string, React.CSSProperties> = {
  heading: { fontSize: '1.6rem', fontWeight: 700, color: '#e8eaf0', marginBottom: '0.4rem' },
  sub: { color: '#9aafc0', marginBottom: '2rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.25rem' },
  card: {
    background: '#1f2d3d',
    borderRadius: 8,
    borderTop: '3px solid',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  count: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 },
  cardLabel: { fontSize: '0.9rem', color: '#9aafc0', textTransform: 'uppercase', letterSpacing: '0.5px' },
};
