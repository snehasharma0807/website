import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export interface Member {
  id: string;
  name: string | null;
  role: string | null;
  bio: string | null;
  photo_url: string | null;
  linkedin: string | null;
  github: string | null;
  graduation_year: string | null;
  created_at: string | null;
}

export type MemberInput = Omit<Member, 'id' | 'created_at'>;

export async function getMembers(): Promise<Member[]> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createMember(input: MemberInput): Promise<Member> {
  const { data, error } = await supabase
    .from('members')
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateMember(id: string, input: Partial<MemberInput>): Promise<Member> {
  const { data, error } = await supabase
    .from('members')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteMember(id: string): Promise<void> {
  const { error } = await supabase.from('members').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function uploadMemberPhoto(file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from('member-photos')
    .upload(path, file, { upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from('member-photos').getPublicUrl(path);
  return data.publicUrl;
}
