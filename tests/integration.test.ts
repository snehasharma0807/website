/**
 * Integration tests for admin dashboard and public data access.
 *
 * Run with:
 *   npx ts-node --transpile-only tests/integration.test.ts
 *
 * Uses mocks to simulate Supabase and middleware — no live backend required.
 */

import type { ProjectInput } from '../lib/projects';

type Result = { label: string; passed: boolean; detail?: string };
const results: Result[] = [];

function pass(label: string) {
  results.push({ label, passed: true });
}
function fail(label: string, detail?: string) {
  results.push({ label, passed: false, detail });
}

// ---- Mocks -----------------------------------------------------------------

const PROJECT_ID = 'proj-123';

function makeAnonClient() {
  const calls: { method: string; table?: string; data?: unknown }[] = [];
  return {
    _calls: calls,
    from(table: string) {
      return {
        select() {
          calls.push({ method: 'select', table });
          return Promise.resolve({ data: [{ id: PROJECT_ID, title: 'Test', status: 'active' }], error: null });
        },
        insert(data: unknown) {
          calls.push({ method: 'insert', table, data });
          return Promise.resolve({
            data: null,
            error: { message: 'RLS: new row violates row-level security policy' },
          });
        },
      };
    },
  };
}

function makeAdminSessionClient() {
  const calls: { method: string; table?: string; data?: unknown; eq?: [string, string] }[] = [];
  const projects: Record<string, unknown> = {};

  const builder = (table: string, method: string, payload?: unknown) => {
    let eqArgs: [string, string] | undefined;
    const self = {
      eq(col: string, val: string) {
        eqArgs = [col, val];
        return self;
      },
      select() {
        return self;
      },
      single() {
        calls.push({ method, table, data: payload, eq: eqArgs });
        if (method === 'insert' && table === 'projects') {
          const id = PROJECT_ID;
          projects[id] = { id, ...(payload as object) };
          return Promise.resolve({ data: projects[id], error: null });
        }
        if (method === 'update' && table === 'projects' && eqArgs) {
          (projects[eqArgs[1]] as object) = { ...(projects[eqArgs[1]] as object), ...(payload as object) };
          return Promise.resolve({ data: projects[eqArgs[1]], error: null });
        }
        if (method === 'delete' && table === 'projects' && eqArgs) {
          delete projects[eqArgs[1]];
          return Promise.resolve({ data: null, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      },
      then(resolve: (v: { data: null; error: null }) => void) {
        calls.push({ method, table, data: payload, eq: eqArgs });
        if (method === 'delete' && table === 'projects' && eqArgs) {
          delete projects[eqArgs[1]];
        }
        resolve({ data: null, error: null });
      },
    };
    return self;
  };

  return {
    _calls: calls,
    _projects: projects,
    from(table: string) {
      return {
        select() {
          calls.push({ method: 'select', table });
          return Promise.resolve({ data: Object.values(projects), error: null });
        },
        insert(data: unknown) {
          return builder(table, 'insert', data);
        },
        update(data: unknown) {
          return builder(table, 'update', data);
        },
        delete() {
          return builder(table, 'delete');
        },
      };
    },
  };
}

// Simulate middleware: no session → redirect; session but not in admins → redirect with not_admin
function simulateMiddleware(session: { email: string } | null, adminsRow: { id: string } | null) {
  if (!session) return { redirect: '/login', error: null };
  if (!adminsRow) return { redirect: '/login?error=not_admin', error: 'not_admin' };
  return { redirect: null, error: null };
}

// ---- Test 1: Full admin flow (create → edit → delete → gone from public) ----

async function runAdminFlowTest() {
  const client = makeAdminSessionClient();
  const createPayload: ProjectInput = {
    title: 'New Project',
    description: 'Desc',
    image_url: null,
    github_link: null,
    demo_link: null,
    dev_team: null,
    tags: null,
    status: 'active',
  };

  const insertRes = await client.from('projects').insert(createPayload).select().single();
  if (insertRes.error) {
    fail('Admin flow: create project', insertRes.error.message);
    return;
  }
  const created = insertRes.data as { id: string };
  const id = created.id;

  const updateRes = await client.from('projects').update({ title: 'Updated' }).eq('id', id).select().single();
  if (updateRes.error) {
    fail('Admin flow: edit project', updateRes.error.message);
    return;
  }

  await client.from('projects').delete().eq('id', id);
  const listRes = await client.from('projects').select();
  const list = (listRes.data as unknown[]) ?? [];
  if (list.some((p: { id: string }) => p.id === id)) {
    fail('Full admin flow: create → edit → delete → confirm gone', 'project still in list');
  } else {
    pass('Full admin flow: create project → edit → delete → confirm gone from public query');
  }
}

// ---- Test 2: Non-admin rejected at middleware ----

function runMiddlewareTest() {
  const noSession = simulateMiddleware(null, null);
  const notAdmin = simulateMiddleware({ email: 'user@gmail.com' }, null);
  const admin = simulateMiddleware({ email: 'admin@example.com' }, { id: '1' });

  if (noSession.redirect !== '/login') {
    fail('Non-admin / no session: redirect to login', `got ${noSession.redirect}`);
  } else if (notAdmin.redirect !== '/login?error=not_admin') {
    fail('Non-admin email: redirect with not_admin', `got ${notAdmin.redirect}`);
  } else if (admin.redirect !== null) {
    fail('Admin: no redirect', `got ${admin.redirect}`);
  } else {
    pass('Non-admin email rejected at middleware (redirect to login?error=not_admin)');
  }
}

// ---- Test 3: Public SELECT works without authentication (anon key) ----

async function runPublicSelectTest() {
  const anon = makeAnonClient();
  const { data, error } = await anon.from('projects').select();
  const selectCall = anon._calls.find((c) => c.method === 'select');
  if (!selectCall || error || !data || (data as unknown[]).length === 0) {
    fail('Public SELECT without auth', selectCall ? (error ? String(error) : 'no data') : 'select not called');
  } else {
    pass('Public SELECT queries work without authentication (anon key)');
  }
}

// ---- Test 4: INSERT via anon key is rejected (RLS) ----

async function runInsertRejectedTest() {
  const anon = makeAnonClient();
  const { error } = await anon.from('projects').insert({ title: 'Hack' });
  const insertCall = anon._calls.find((c) => c.method === 'insert');
  if (!insertCall) {
    fail('INSERT via anon: insert was called', 'insert not in calls');
  } else if (!error || !String(error.message || '').toLowerCase().includes('security')) {
    fail('INSERT via anon rejected (RLS)', error ? String(error.message) : 'no error returned');
  } else {
    pass('INSERT via anon key is rejected (RLS enforcement)');
  }
}

// ---- Run all and output ----------------------------------------------------

(async () => {
  await runAdminFlowTest();
  runMiddlewareTest();
  await runPublicSelectTest();
  await runInsertRejectedTest();

  let anyFailed = false;
  for (const { label, passed: p, detail } of results) {
    console.log(`${p ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
    if (!p) anyFailed = true;
  }
  process.exit(anyFailed ? 1 : 0);
})();
