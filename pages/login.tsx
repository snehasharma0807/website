/**
 * Login page — Google OAuth via Supabase Auth.
 *
 * SUPABASE DASHBOARD SETUP (do this once):
 *
 * 1. Authentication → Providers → Google → Enable
 *    - Create a Google OAuth app at https://console.cloud.google.com/
 *    - Authorized redirect URI: https://<your-project>.supabase.co/auth/v1/callback
 *    - Paste Client ID and Client Secret into Supabase dashboard
 *
 * 2. Authentication → URL Configuration
 *    - Site URL: http://localhost:3000 (dev) / your prod URL
 *    - Redirect URLs: add http://localhost:3000/admin
 *
 * 3. Add yourself to the admins table:
 *    INSERT INTO admins (email) VALUES ('you@example.com');
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { flowType: 'implicit' } },
);

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pick up ?error= param set by middleware for non-admin redirects
  useEffect(() => {
    const { error: qError } = router.query;
    if (qError === 'not_admin') {
      setError('Your account is not authorised as an admin.');
    }
  }, [router.query]);

  async function handleSignIn() {
    setLoading(true);
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
    // On success the browser is redirected by Supabase — no further action needed.
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Admin Login</h1>
        <p style={styles.subtitle}>Hack4Impact Penn</p>

        {error && <p style={styles.error}>{error}</p>}

        <button onClick={handleSignIn} disabled={loading} style={styles.button}>
          {loading ? 'Redirecting…' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f5f5',
  },
  card: {
    background: '#fff',
    borderRadius: 8,
    padding: '2.5rem 3rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: 360,
    width: '100%',
  },
  title: { margin: 0, fontSize: '1.5rem' },
  subtitle: { color: '#666', marginBottom: '1.5rem' },
  error: {
    background: '#ffeaea',
    color: '#c0392b',
    borderRadius: 4,
    padding: '0.6rem 1rem',
    marginBottom: '1rem',
    fontSize: '0.9rem',
  },
  button: {
    background: '#4285F4',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    cursor: 'pointer',
    width: '100%',
  },
};
