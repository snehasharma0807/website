/**
 * Supabase schema connectivity test.
 *
 * Run with:
 *   npx ts-node tests/supabase-schema.test.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * to be set in your .env file (or environment).
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('FAIL  Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Result = { label: string; passed: boolean; detail?: string };

async function checkTable(table: string): Promise<Result> {
  const { error } = await supabase.from(table).select('id').limit(1);
  if (error) {
    return { label: `Table: ${table}`, passed: false, detail: error.message };
  }
  return { label: `Table: ${table}`, passed: true };
}

async function checkBuckets(): Promise<Result[]> {
  const expected = ['project-images', 'member-photos', 'sponsor-logos'];
  const { data, error } = await supabase.storage.listBuckets();

  if (error || !data) {
    return expected.map(b => ({
      label: `Bucket: ${b}`,
      passed: false,
      detail: error?.message ?? 'No data returned',
    }));
  }

  const found = new Set(data.map((b: { name: string }) => b.name));
  return expected.map(b => ({
    label: `Bucket: ${b}`,
    passed: found.has(b),
    detail: found.has(b) ? undefined : 'Bucket not found',
  }));
}

async function run() {
  const tables = ['projects', 'members', 'sponsors', 'alumni', 'admins'];
  const tableResults = await Promise.all(tables.map(checkTable));
  const bucketResults = await checkBuckets();

  const all: Result[] = [...tableResults, ...bucketResults];
  let anyFailed = false;

  for (const { label, passed, detail } of all) {
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
