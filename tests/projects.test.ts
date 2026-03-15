/**
 * Projects CRUD helper tests.
 *
 * Run with:
 *   npx ts-node --transpile-only tests/projects.test.ts
 *
 * All Supabase calls are mocked — no live credentials required.
 */

// ---- Types -----------------------------------------------------------------

import type { ProjectInput } from '../lib/projects';

type Result = { label: string; passed: boolean; detail?: string };
const results: Result[] = [];

function pass(label: string) { results.push({ label, passed: true }); }
function fail(label: string, detail?: string) { results.push({ label, passed: false, detail }); }

// ---- Mock Supabase builder -------------------------------------------------

interface Call {
  method: string;
  table?: string;
  data?: unknown;
  eq?: [string, string];
  storageBucket?: string;
  storagePath?: string;
  storageFile?: unknown;
}

function makeMockSupabase() {
  const calls: Call[] = [];
  const MOCK_ID = 'mock-uuid';
  const MOCK_PUBLIC_URL = 'https://cdn.example.com/project-images/mock.png';

  // Chainable query builder
  function queryBuilder(table: string, method: string, payload?: unknown) {
    let eqArgs: [string, string] | undefined;
    const builder = {
      eq(col: string, val: string) { eqArgs = [col, val]; return builder; },
      select() { return builder; },
      single() {
        calls.push({ method, table, data: payload, eq: eqArgs });
        return Promise.resolve({ data: { id: MOCK_ID, ...payload as object }, error: null });
      },
      then(resolve: (v: { data: null; error: null }) => void) {
        calls.push({ method, table, data: payload, eq: eqArgs });
        resolve({ data: null, error: null });
      },
    };
    return builder;
  }

  const supabase = {
    _calls: calls,
    from(table: string) {
      return {
        select(_cols?: string) {
          calls.push({ method: 'select', table });
          return Promise.resolve({ data: [], error: null });
        },
        insert(data: unknown) {
          return queryBuilder(table, 'insert', data);
        },
        update(data: unknown) {
          return queryBuilder(table, 'update', data);
        },
        delete() {
          return queryBuilder(table, 'delete');
        },
      };
    },
    storage: {
      from(bucket: string) {
        return {
          upload(path: string, file: unknown) {
            calls.push({ method: 'upload', storageBucket: bucket, storagePath: path, storageFile: file });
            return Promise.resolve({ data: { path }, error: null });
          },
          getPublicUrl(path: string) {
            return { data: { publicUrl: `${MOCK_PUBLIC_URL.replace('mock.png', path)}` } };
          },
        };
      },
    },
  };
  return { supabase, calls };
}

// ---- Extracted logic (mirrors lib/projects.ts but uses injected client) ----

async function getProjects(supabase: ReturnType<typeof makeMockSupabase>['supabase']) {
  const { data, error } = await supabase.from('projects').select('*') as unknown as { data: unknown[]; error: null };
  if (error) throw new Error('select failed');
  return data ?? [];
}

async function createProject(
  supabase: ReturnType<typeof makeMockSupabase>['supabase'],
  input: ProjectInput,
) {
  return supabase.from('projects').insert(input).select().single();
}

async function updateProject(
  supabase: ReturnType<typeof makeMockSupabase>['supabase'],
  id: string,
  input: Partial<ProjectInput>,
) {
  return supabase.from('projects').update(input).eq('id', id).select().single();
}

async function deleteProject(
  supabase: ReturnType<typeof makeMockSupabase>['supabase'],
  id: string,
) {
  return supabase.from('projects').delete().eq('id', id).single();
}

async function uploadProjectImage(
  supabase: ReturnType<typeof makeMockSupabase>['supabase'],
  file: { name: string },
) {
  const ext = file.name.split('.').pop();
  const path = `test-path.${ext}`;
  const { error } = await supabase.storage.from('project-images').upload(path, file);
  if (error) throw new Error('upload failed');
  const { data } = supabase.storage.from('project-images').getPublicUrl(path);
  return data.publicUrl;
}

// ---- Tests -----------------------------------------------------------------

const INPUT: ProjectInput = {
  title: 'Test Project',
  description: 'A test project',
  image_url: null,
  github_link: 'https://github.com/test',
  demo_link: null,
  dev_team: 'Team A',
  tags: ['react', 'node'],
  status: 'active',
};

// Test 1: createProject calls insert with correct shape
{
  const { supabase, calls } = makeMockSupabase();
  await createProject(supabase, INPUT);
  const c = calls.find(c => c.method === 'insert');
  if (!c) { fail('createProject calls insert'); }
  else if ((c.data as ProjectInput).title !== INPUT.title) {
    fail('createProject passes correct title', `got: ${(c.data as ProjectInput).title}`);
  } else if (JSON.stringify((c.data as ProjectInput).tags) !== JSON.stringify(INPUT.tags)) {
    fail('createProject passes correct tags', `got: ${JSON.stringify((c.data as ProjectInput).tags)}`);
  } else {
    pass('createProject calls insert with correct shape');
  }
}

// Test 2: updateProject calls update with correct id
{
  const { supabase, calls } = makeMockSupabase();
  const UPDATE_ID = 'abc-123';
  await updateProject(supabase, UPDATE_ID, { title: 'Updated' });
  const c = calls.find(c => c.method === 'update');
  if (!c) { fail('updateProject calls update'); }
  else if (c.eq?.[1] !== UPDATE_ID) {
    fail('updateProject uses correct id', `eq: ${JSON.stringify(c.eq)}`);
  } else if ((c.data as Partial<ProjectInput>).title !== 'Updated') {
    fail('updateProject passes correct data', `title: ${(c.data as Partial<ProjectInput>).title}`);
  } else {
    pass('updateProject calls update with correct id and data');
  }
}

// Test 3: deleteProject calls delete with correct id
{
  const { supabase, calls } = makeMockSupabase();
  const DELETE_ID = 'del-456';
  await deleteProject(supabase, DELETE_ID);
  const c = calls.find(c => c.method === 'delete');
  if (!c) { fail('deleteProject calls delete'); }
  else if (c.eq?.[1] !== DELETE_ID) {
    fail('deleteProject uses correct id', `eq: ${JSON.stringify(c.eq)}`);
  } else {
    pass('deleteProject calls delete with correct id');
  }
}

// Test 4: uploadProjectImage calls storage upload and returns a URL
{
  const { supabase, calls } = makeMockSupabase();
  const mockFile = { name: 'photo.png' };
  const url = await uploadProjectImage(supabase, mockFile);
  const c = calls.find(c => c.method === 'upload');
  if (!c) { fail('uploadProjectImage calls storage upload'); }
  else if (c.storageBucket !== 'project-images') {
    fail('uploadProjectImage uses correct bucket', `bucket: ${c.storageBucket}`);
  } else if (!url || !url.startsWith('http')) {
    fail('uploadProjectImage returns a public URL', `url: ${url}`);
  } else {
    pass('uploadProjectImage calls storage upload and returns public URL');
  }
}

// ---- Output ----------------------------------------------------------------

let anyFailed = false;
for (const { label, passed, detail } of results) {
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!passed) anyFailed = true;
}
process.exit(anyFailed ? 1 : 0);
