import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export interface Alumni {
  id: string;
  name: string | null;
  graduation_year: string | null;
  created_at: string | null;
}

export type AlumniInput = Omit<Alumni, 'id' | 'created_at'>;

export async function getAlumni(): Promise<Alumni[]> {
  const { data, error } = await supabase
    .from('alumni')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createAlumni(input: AlumniInput): Promise<Alumni> {
  const { data, error } = await supabase
    .from('alumni')
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateAlumni(id: string, input: Partial<AlumniInput>): Promise<Alumni> {
  const { data, error } = await supabase
    .from('alumni')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteAlumni(id: string): Promise<void> {
  const { error } = await supabase.from('alumni').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
