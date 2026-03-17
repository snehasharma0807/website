/**
 * Server-side public data access using anon key (read-only).
 * Use in getStaticProps / getServerSideProps.
 */

import { supabase } from './supabaseClient';

/** All projects for homepage and /projects, ordered by semester (newest first). */
export async function getActiveProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Fetch a single project by id (for /projects/[projectSlug] when slug is a UUID). */
export async function getProjectById(id: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getMembersPublic() {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Fetch a single member by id (for /team/[memberSlug] when slug is a UUID). */
export async function getMemberById(id: string) {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getSponsorsPublic() {
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAlumniPublic() {
  const { data, error } = await supabase
    .from('alumni')
    .select('*')
    .order('graduation_year', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
