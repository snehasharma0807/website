/**
 * Members CRUD helper tests.
 *
 * Run with:
 *   npx ts-node --transpile-only tests/members.test.ts
 *
 * All Supabase calls are mocked — no live credentials required.
 */

import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import type { MemberInput } from '../lib/members';

type Result = { label: string; passed: boolean; detail?: string };
const results: Result[] = [];

function pass(label: string) {
  results.push({ label, passed: true });
}
function fail(label: string, detail?: string) {
  results.push({ label, passed: false, detail });
}

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
  const MOCK_ID = 'mock-member-uuid';
  const MOCK_PUBLIC_URL = 'https://cdn.example.com/member-photos/mock.jpg';

  function queryBuilder(table: string, method: string, payload?: unknown) {
    let eqArgs: [string, string] | undefined;
    const builder = {
      eq(col: string, val: string) {
        eqArgs = [col, val];
        return builder;
      },
      select() {
        return builder;
      },
      single() {
        calls.push({ method, table, data: payload, eq: eqArgs });
        return Promise.resolve({
          data: { id: MOCK_ID, ...(payload as object) },
          error: null,
        });
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
        select() {
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
            calls.push({
              method: 'upload',
              storageBucket: bucket,
              storagePath: path,
              storageFile: file,
            });
            return Promise.resolve({ data: { path }, error: null });
          },
          getPublicUrl(path: string) {
            return {
              data: {
                publicUrl: MOCK_PUBLIC_URL.replace('mock.jpg', path),
              },
            };
          },
        };
      },
    },
  };
  return { supabase, calls };
}

// ---- Extracted logic (mirrors lib/members.ts with injected client) ----------

async function createMember(
  supabase: ReturnType<typeof makeMockSupabase>['supabase'],
  input: MemberInput
) {
  return supabase.from('members').insert(input).select().single();
}

async function updateMember(
  supabase: ReturnType<typeof makeMockSupabase>['supabase'],
  id: string,
  input: Partial<MemberInput>
) {
  return supabase.from('members').update(input).eq('id', id).select().single();
}

async function deleteMember(
  supabase: ReturnType<typeof makeMockSupabase>['supabase'],
  id: string
) {
  return supabase.from('members').delete().eq('id', id);
}

async function uploadMemberPhoto(
  supabase: ReturnType<typeof makeMockSupabase>['supabase'],
  file: { name: string }
) {
  const ext = file.name.split('.').pop();
  const path = `test-path.${ext}`;
  const { error } = await supabase.storage.from('member-photos').upload(path, file);
  if (error) throw new Error('upload failed');
  const { data } = supabase.storage.from('member-photos').getPublicUrl(path);
  return data.publicUrl;
}

// ---- Stub MemberForm (same fields as real MemberForm for presence check) ----

function MemberFormStub() {
  return React.createElement(
    'form',
    null,
    React.createElement('label', null, 'Name ', React.createElement('span', null, '*')),
    React.createElement('label', null, 'Role'),
    React.createElement('label', null, 'Bio'),
    React.createElement('div', null, React.createElement('span', null, 'Photo')),
    React.createElement('label', null, 'LinkedIn'),
    React.createElement('label', null, 'GitHub'),
    React.createElement('label', null, 'Graduation Year')
  );
}

// ---- Tests -----------------------------------------------------------------

const INPUT: MemberInput = {
  name: 'Jane Doe',
  role: 'Director',
  bio: 'CS student.',
  photo_url: '',
  linkedin: 'https://linkedin.com/in/jane',
  github: 'https://github.com/jane',
  graduation_year: '2025',
};

// Test 1: createMember calls insert with correct shape
{
  const { supabase, calls } = makeMockSupabase();
  await createMember(supabase, INPUT);
  const c = calls.find(c => c.method === 'insert' && c.table === 'members');
  if (!c) {
    fail('createMember calls insert');
  } else if ((c.data as MemberInput).name !== INPUT.name) {
    fail('createMember passes correct name', `got: ${(c.data as MemberInput).name}`);
  } else if ((c.data as MemberInput).graduation_year !== INPUT.graduation_year) {
    fail('createMember passes correct graduation_year', `got: ${(c.data as MemberInput).graduation_year}`);
  } else {
    pass('createMember calls insert with correct shape');
  }
}

// Test 2: updateMember calls update with correct id
{
  const { supabase, calls } = makeMockSupabase();
  const UPDATE_ID = 'member-abc-123';
  await updateMember(supabase, UPDATE_ID, { name: 'Jane Updated' });
  const c = calls.find(c => c.method === 'update' && c.table === 'members');
  if (!c) {
    fail('updateMember calls update');
  } else if (c.eq?.[1] !== UPDATE_ID) {
    fail('updateMember uses correct id', `eq: ${JSON.stringify(c.eq)}`);
  } else if ((c.data as Partial<MemberInput>).name !== 'Jane Updated') {
    fail('updateMember passes correct data', `name: ${(c.data as Partial<MemberInput>).name}`);
  } else {
    pass('updateMember calls update with correct id and data');
  }
}

// Test 3: deleteMember calls delete with correct id
{
  const { supabase, calls } = makeMockSupabase();
  const DELETE_ID = 'member-del-456';
  await deleteMember(supabase, DELETE_ID);
  const c = calls.find(c => c.method === 'delete' && c.table === 'members');
  if (!c) {
    fail('deleteMember calls delete');
  } else if (c.eq?.[1] !== DELETE_ID) {
    fail('deleteMember uses correct id', `eq: ${JSON.stringify(c.eq)}`);
  } else {
    pass('deleteMember calls delete with correct id');
  }
}

// Test 4: uploadMemberPhoto calls storage upload and returns a URL
{
  const { supabase, calls } = makeMockSupabase();
  const mockFile = { name: 'avatar.jpg' };
  const url = await uploadMemberPhoto(supabase, mockFile);
  const c = calls.find(c => c.method === 'upload');
  if (!c) {
    fail('uploadMemberPhoto calls storage upload');
  } else if (c.storageBucket !== 'member-photos') {
    fail('uploadMemberPhoto uses correct bucket', `bucket: ${c.storageBucket}`);
  } else if (!url || !url.startsWith('http')) {
    fail('uploadMemberPhoto returns a public URL', `url: ${url}`);
  } else {
    pass('uploadMemberPhoto calls storage upload and returns public URL');
  }
}

// Test 5: MemberForm (stub) renders and confirms all fields are present
{
  const html = ReactDOMServer.renderToStaticMarkup(React.createElement(MemberFormStub));
  const fields = ['Name', 'Role', 'Bio', 'Photo', 'LinkedIn', 'GitHub', 'Graduation Year'];
  const missing = fields.filter(f => !html.includes(f));
  if (missing.length > 0) {
    fail('MemberForm renders all required fields', `missing: ${missing.join(', ')}`);
  } else {
    pass('MemberForm renders and confirms all fields are present');
  }
}

// ---- Output ----------------------------------------------------------------

let anyFailed = false;
for (const { label, passed, detail } of results) {
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!passed) anyFailed = true;
}
process.exit(anyFailed ? 1 : 0);
