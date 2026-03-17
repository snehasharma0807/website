import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export interface Sponsor {
  id: string;
  name: string | null;
  logo_url: string | null;
  website: string | null;
  tier: string | null;
  created_at: string | null;
}

export type SponsorInput = Omit<Sponsor, 'id' | 'created_at'>;

export async function getSponsors(): Promise<Sponsor[]> {
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createSponsor(input: SponsorInput): Promise<Sponsor> {
  const { data, error } = await supabase
    .from('sponsors')
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateSponsor(id: string, input: Partial<SponsorInput>): Promise<Sponsor> {
  const { data, error } = await supabase
    .from('sponsors')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteSponsor(id: string): Promise<void> {
  const { error } = await supabase.from('sponsors').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function uploadSponsorLogo(file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from('sponsor-logos')
    .upload(path, file, { upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from('sponsor-logos').getPublicUrl(path);
  return data.publicUrl;
}
