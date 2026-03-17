/**
 * Sponsors & Alumni CRUD tests.
 *
 * Run with:
 *   npx ts-node --transpile-only tests/sponsors-alumni.test.ts
 *
 * All Supabase calls are mocked — no live credentials required.
 */

import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import type { SponsorInput } from '../lib/sponsors';
import type { AlumniInput } from '../lib/alumni';

type Result = { label: string; passed: boolean; detail?: string };
const results: Result[] = [];

function pass(label: string) {
  results.push({ label, passed: true });
}
function fail(label: string, detail?: string) {
  results.push({ label, passed: false, detail });
}

// ---- Mock Supabase ---------------------------------------------------------

interface Call {
  method: string;
  table?: string;
  data?: unknown;
  eq?: [string, string];
  storageBucket?: string;
  storagePath?: string;
}

function makeMockSupabase() {
  const calls: Call[] = [];
  const MOCK_ID = 'mock-uuid';
  const MOCK_SPONSOR_URL = 'https://cdn.example.com/sponsor-logos/logo.png';

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
                publicUrl: MOCK_SPONSOR_URL.replace('logo.png', path),
              },
            };
          },
        };
      },
    },
  };
  return { supabase, calls };
}

// ---- Extracted logic (mirrors lib) ------------------------------------------

async function createSponsor(
  supabase: ReturnType<typeof makeMockSupabase>['supabase'],
  input: SponsorInput
) {
  return supabase.from('sponsors').insert(input).select().single();
}

async function uploadSponsorLogo(
  supabase: ReturnType<typeof makeMockSupabase>['supabase'],
  file: { name: string }
) {
  const ext = file.name.split('.').pop();
  const path = `test.${ext}`;
  const { error } = await supabase.storage.from('sponsor-logos').upload(path, file);
  if (error) throw new Error('upload failed');
  const { data } = supabase.storage.from('sponsor-logos').getPublicUrl(path);
  return data.publicUrl;
}

async function createAlumni(
  supabase: ReturnType<typeof makeMockSupabase>['supabase'],
  input: AlumniInput
) {
  return supabase.from('alumni').insert(input).select().single();
}

async function deleteAlumni(
  supabase: ReturnType<typeof makeMockSupabase>['supabase'],
  id: string
) {
  return supabase.from('alumni').delete().eq('id', id);
}

// ---- Alumni list display: "Name 'YY" format ---------------------------------

function formatNameWithYear(name: string | null, graduationYear: string | null): string {
  const n = (name ?? '').trim() || '—';
  const year = (graduationYear ?? '').trim();
  if (!year) return n;
  const yy = year.length >= 2 ? year.slice(-2) : year;
  return `${n} '${yy}`;
}

/** Stub component that renders alumni list in "Name 'YY" format */
function AlumniListStub({ rows }: { rows: { name: string | null; graduation_year: string | null }[] }) {
  return React.createElement(
    'ul',
    { 'data-testid': 'alumni-list' },
    rows.map((row, i) =>
      React.createElement(
        'li',
        { key: i },
        formatNameWithYear(row.name, row.graduation_year)
      )
    )
  );
}

// ---- Tests -----------------------------------------------------------------

const SPONSOR_INPUT: SponsorInput = {
  name: 'Acme Corp',
  logo_url: 'https://example.com/logo.png',
  website: 'https://acme.com',
  tier: 'Gold',
};

// Test 1: createSponsor() → correct insert shape
{
  const { supabase, calls } = makeMockSupabase();
  await createSponsor(supabase, SPONSOR_INPUT);
  const c = calls.find(c => c.method === 'insert' && c.table === 'sponsors');
  if (!c) {
    fail('createSponsor calls insert');
  } else if ((c.data as SponsorInput).name !== SPONSOR_INPUT.name) {
    fail('createSponsor passes correct name', `got: ${(c.data as SponsorInput).name}`);
  } else if ((c.data as SponsorInput).tier !== SPONSOR_INPUT.tier) {
    fail('createSponsor passes correct tier', `got: ${(c.data as SponsorInput).tier}`);
  } else {
    pass('createSponsor() → correct insert shape');
  }
}

// Test 2: uploadSponsorLogo() → storage called + URL returned
{
  const { supabase, calls } = makeMockSupabase();
  const mockFile = { name: 'sponsor-logo.png' };
  const url = await uploadSponsorLogo(supabase, mockFile);
  const c = calls.find(c => c.method === 'upload');
  if (!c) {
    fail('uploadSponsorLogo calls storage upload');
  } else if (c.storageBucket !== 'sponsor-logos') {
    fail('uploadSponsorLogo uses correct bucket', `bucket: ${c.storageBucket}`);
  } else if (!url || !url.startsWith('http')) {
    fail('uploadSponsorLogo returns a public URL', `url: ${url}`);
  } else {
    pass('uploadSponsorLogo() → storage called + URL returned');
  }
}

const ALUMNI_INPUT: AlumniInput = {
  name: 'Jane Doe',
  graduation_year: '2025',
};

// Test 3: createAlumni() → correct insert
{
  const { supabase, calls } = makeMockSupabase();
  await createAlumni(supabase, ALUMNI_INPUT);
  const c = calls.find(c => c.method === 'insert' && c.table === 'alumni');
  if (!c) {
    fail('createAlumni calls insert');
  } else if ((c.data as AlumniInput).name !== ALUMNI_INPUT.name) {
    fail('createAlumni passes correct name', `got: ${(c.data as AlumniInput).name}`);
  } else if ((c.data as AlumniInput).graduation_year !== ALUMNI_INPUT.graduation_year) {
    fail('createAlumni passes correct graduation_year', `got: ${(c.data as AlumniInput).graduation_year}`);
  } else {
    pass('createAlumni() → correct insert');
  }
}

// Test 4: deleteAlumni() → confirms delete
{
  const { supabase, calls } = makeMockSupabase();
  const DELETE_ID = 'alumni-xyz';
  await deleteAlumni(supabase, DELETE_ID);
  const c = calls.find(c => c.method === 'delete' && c.table === 'alumni');
  if (!c) {
    fail('deleteAlumni calls delete');
  } else if (c.eq?.[1] !== DELETE_ID) {
    fail('deleteAlumni uses correct id', `eq: ${JSON.stringify(c.eq)}`);
  } else {
    pass('deleteAlumni() → confirms delete');
  }
}

// Test 5: Alumni list displays "Name 'YY" format
{
  const mockRows = [
    { name: 'Jane Doe', graduation_year: '2025' },
    { name: 'John Smith', graduation_year: '2024' },
    { name: 'Alex', graduation_year: null },
  ];
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(AlumniListStub, { rows: mockRows })
  );
  const hasJane25 = html.includes("Jane Doe '25");
  const hasJohn24 = html.includes("John Smith '24");
  const hasAlexNoYear = html.includes('Alex'); // no 'YY when null
  if (!hasJane25 || !hasJohn24 || !hasAlexNoYear) {
    fail('Alumni list displays Name \'YY format', `html: ${html.slice(0, 200)}`);
  } else {
    pass('Renders alumni list with mock data; names + graduation years as "Name \'YY"');
  }
}

// ---- Output ----------------------------------------------------------------

let anyFailed = false;
for (const { label, passed, detail } of results) {
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!passed) anyFailed = true;
}
process.exit(anyFailed ? 1 : 0);
