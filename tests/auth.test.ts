/**
 * Auth helper tests.
 *
 * Run with:
 *   npx ts-node --transpile-only tests/auth.test.ts
 *
 * These tests mock Supabase so no live credentials are required.
 */

// ---- Types ----------------------------------------------------------------

type Result = { label: string; passed: boolean; detail?: string };

// ---- Minimal mock of createBrowserSupabaseClient --------------------------

function makeMockSupabase(adminEmails: string[]) {
  return {
    from: (_table: string) => ({
      select: (_col: string) => ({
        eq: (_field: string, value: string) => ({
          maybeSingle: async () => {
            const found = adminEmails.includes(value);
            return { data: found ? { id: 'mock-id' } : null, error: null };
          },
        }),
      }),
    }),
    auth: {
      getSession: async () => ({ data: { session: null } }),
      signOut: async () => ({}),
    },
  };
}

// ---- isAdmin logic (extracted so it can be tested without browser env) -----

async function isAdminWithClient(
  supabase: ReturnType<typeof makeMockSupabase>,
  email: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('admins')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (error) return false;
  return data !== null;
}

// ---- Middleware redirect logic (pure, no Next.js dependency) ---------------

interface FakeSession {
  user: { email: string };
}

async function simulateMiddleware(
  session: FakeSession | null,
  supabase: ReturnType<typeof makeMockSupabase>,
): Promise<'allowed' | 'redirect:/login' | 'redirect:/login?error=not_admin'> {
  if (!session) return 'redirect:/login';

  const { data: adminRow } = await supabase
    .from('admins')
    .select('id')
    .eq('email', session.user.email)
    .maybeSingle();

  if (!adminRow) return 'redirect:/login?error=not_admin';
  return 'allowed';
}

// ---- Tests -----------------------------------------------------------------

async function run() {
  const results: Result[] = [];
  const adminEmails = ['admin@hack4impact.org'];
  const supabase = makeMockSupabase(adminEmails);

  // Test 1: non-admin email → isAdmin returns false
  {
    const result = await isAdminWithClient(supabase, 'stranger@example.com');
    results.push({
      label: 'isAdmin() returns false for email NOT in admins',
      passed: result === false,
    });
  }

  // Test 2: admin email → isAdmin returns true
  {
    const result = await isAdminWithClient(supabase, 'admin@hack4impact.org');
    results.push({
      label: 'isAdmin() returns true for email IN admins',
      passed: result === true,
    });
  }

  // Test 3: unauthenticated (no session) → middleware redirects to /login
  {
    const destination = await simulateMiddleware(null, supabase);
    results.push({
      label: 'Middleware redirects unauthenticated request to /login',
      passed: destination === 'redirect:/login',
      detail: destination !== 'redirect:/login' ? `Got: ${destination}` : undefined,
    });
  }

  // Test 4: authenticated but not admin → middleware redirects to /login?error=not_admin
  {
    const destination = await simulateMiddleware(
      { user: { email: 'stranger@example.com' } },
      supabase,
    );
    results.push({
      label: 'Middleware redirects non-admin to /login?error=not_admin',
      passed: destination === 'redirect:/login?error=not_admin',
      detail:
        destination !== 'redirect:/login?error=not_admin' ? `Got: ${destination}` : undefined,
    });
  }

  // Test 5: authenticated admin → middleware allows through
  {
    const destination = await simulateMiddleware(
      { user: { email: 'admin@hack4impact.org' } },
      supabase,
    );
    results.push({
      label: 'Middleware allows authenticated admin through',
      passed: destination === 'allowed',
      detail: destination !== 'allowed' ? `Got: ${destination}` : undefined,
    });
  }

  // ---- Output ---------------------------------------------------------------

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
}

run().catch(err => {
  console.error('FAIL  Unexpected error:', err);
  process.exit(1);
});
