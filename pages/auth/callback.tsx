/**
 * OAuth implicit-flow callback page.
 *
 * After Google redirects back via Supabase, the browser lands here with the
 * access token in the URL hash (#access_token=...). The Supabase JS client
 * automatically detects and stores the session from the hash on mount.
 * We then wait for the SIGNED_IN event and push to /admin.
 */
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { flowType: 'implicit' } },
);

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('Completing sign-in…');

  useEffect(() => {
    // onAuthStateChange fires with SIGNED_IN once the token in the hash is processed
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        subscription.unsubscribe();
        router.replace('/admin');
      }
      if (event === 'SIGNED_OUT') {
        setStatus('Sign-in failed. Redirecting to login…');
        setTimeout(() => router.replace('/login'), 1500);
      }
    });

    // Fallback: if the session is already present (e.g. page refreshed), redirect immediately
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        subscription.unsubscribe();
        router.replace('/admin');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div style={s.container}>
      <p style={s.text}>{status}</p>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1a1f2e',
  },
  text: {
    color: '#80d2c8',
    fontSize: '1rem',
  },
};
