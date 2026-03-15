import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import type { Session } from '@supabase/supabase-js';

// Singleton browser client — safe to call multiple times
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

/** Returns the current session, or null if unauthenticated. */
export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Returns true if the given email exists in the admins table.
 * Uses the public anon client — relies on the SELECT policy allowing
 * the is_admin() check (or public read if you've opened it up).
 */
export async function isAdmin(email: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('admins')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('[isAdmin] error:', error.message);
    return false;
  }
  return data !== null;
}

/** Signs the user out and redirects to /login. */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
  window.location.href = '/login';
}
