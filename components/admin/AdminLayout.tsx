import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import SignOutButton from './SignOutButton';
import type { User } from '@supabase/supabase-js';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const NAV_LINKS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/members', label: 'Members' },
  { href: '/admin/sponsors', label: 'Sponsors' },
  { href: '/admin/alumni', label: 'Alumni' },
];

interface Props {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/login');
        return;
      }
      setUser(data.session.user);
    });
  }, []);

  return (
    <div style={s.shell}>
      {/* ── Sidebar ── */}
      <aside style={s.sidebar}>
        <div style={s.logoArea}>
          <span style={s.logoText}>H4I Admin</span>
        </div>
        <nav style={s.nav}>
          {NAV_LINKS.map(({ href, label }) => {
            const active =
              href === '/admin'
                ? router.pathname === '/admin'
                : router.pathname.startsWith(href);
            return (
              <Link key={href} href={href}>
                <a style={{ ...s.navLink, ...(active ? s.navLinkActive : {}) }}>{label}</a>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ── Main area ── */}
      <div style={s.main}>
        {/* Top bar */}
        <header style={s.topBar}>
          <span style={s.userEmail}>{user?.email ?? '…'}</span>
          <SignOutButton className="admin-signout-btn" />
        </header>

        {/* Page content */}
        <main style={s.content}>{children}</main>
      </div>

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #1a1f2e; font-family: 'HK Grotesk', sans-serif; }

        .admin-signout-btn {
          color: #80d2c8;
          border-color: #80d2c8 !important;
          font-size: 0.85rem;
          padding: 0.35rem 0.8rem;
          border-radius: 4px;
          transition: opacity 0.15s;
        }
        .admin-signout-btn:hover { opacity: 0.75; }
      `}</style>
    </div>
  );
}

const SIDEBAR_W = 220;

const s: Record<string, React.CSSProperties> = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
    background: '#1a1f2e',
    color: '#e8eaf0',
  },
  sidebar: {
    width: SIDEBAR_W,
    minWidth: SIDEBAR_W,
    background: '#172a3a',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #243547',
  },
  logoArea: {
    padding: '1.5rem 1.25rem',
    borderBottom: '1px solid #243547',
  },
  logoText: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#80d2c8',
    letterSpacing: '0.5px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem 0',
  },
  navLink: {
    display: 'block',
    padding: '0.65rem 1.25rem',
    color: '#9aafc0',
    textDecoration: 'none',
    fontSize: '0.95rem',
    borderLeft: '3px solid transparent',
    transition: 'color 0.15s, background 0.15s',
  },
  navLinkActive: {
    color: '#ffffff',
    background: 'rgba(0,105,202,0.18)',
    borderLeftColor: '#0069ca',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  topBar: {
    height: 56,
    background: '#172a3a',
    borderBottom: '1px solid #243547',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '1rem',
    padding: '0 1.5rem',
  },
  userEmail: {
    fontSize: '0.875rem',
    color: '#9aafc0',
  },
  content: {
    flex: 1,
    padding: '2rem',
    overflowY: 'auto',
  },
};
