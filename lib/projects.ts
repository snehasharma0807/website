import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export interface ProjectFeature {
  header: string;
  body: string;
  image_url: string;
}

export interface ProjectTeamMember {
  name: string;
  title: string;
  image_url: string;
  linkedin: string;
  role: 'lead' | 'developer';
}

export interface ProjectTestimonial {
  author: string;
  quote: string;
}

export interface Project {
  id: string;
  title: string | null;
  title_abbrev: string | null;
  description: string | null;
  image_url: string | null;
  github_link: string | null;
  demo_link: string | null;
  dev_team: string | null;
  tags: string[] | null;
  status: 'active' | 'archived' | null;
  semester: string | null;
  about_project: string | null;
  about_client: string | null;
  impact: string | null;
  features: ProjectFeature[] | null;
  team_members: ProjectTeamMember[] | null;
  testimonials: ProjectTestimonial[] | null;
  created_at: string | null;
}

export type ProjectInput = Omit<Project, 'id' | 'created_at'>;

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateProject(id: string, input: Partial<ProjectInput>): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function uploadProjectImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from('project-images')
    .upload(path, file, { upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from('project-images').getPublicUrl(path);
  return data.publicUrl;
}
