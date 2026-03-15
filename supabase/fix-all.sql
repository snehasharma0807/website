-- ============================================================
-- Run this entire file in the Supabase SQL editor.
-- It is safe to re-run (uses DROP IF EXISTS / ON CONFLICT).
-- ============================================================

-- ---- 1. SECURITY DEFINER function (breaks the RLS recursion) ----

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins WHERE email = auth.email()
  );
$$;

-- ---- 2. Drop ALL existing policies on admins and recreate ----

DROP POLICY IF EXISTS "admins_select" ON public.admins;
DROP POLICY IF EXISTS "admins_insert" ON public.admins;
DROP POLICY IF EXISTS "admins_update" ON public.admins;
DROP POLICY IF EXISTS "admins_delete" ON public.admins;

CREATE POLICY "admins_select" ON public.admins
  FOR SELECT USING (public.is_admin());

CREATE POLICY "admins_insert" ON public.admins
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "admins_update" ON public.admins
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "admins_delete" ON public.admins
  FOR DELETE USING (public.is_admin());

-- ---- 3. Drop and recreate write policies on other tables ----

DROP POLICY IF EXISTS "projects_insert" ON public.projects;
DROP POLICY IF EXISTS "projects_update" ON public.projects;
DROP POLICY IF EXISTS "projects_delete" ON public.projects;

CREATE POLICY "projects_insert" ON public.projects
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "projects_update" ON public.projects
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "projects_delete" ON public.projects
  FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "members_insert" ON public.members;
DROP POLICY IF EXISTS "members_update" ON public.members;
DROP POLICY IF EXISTS "members_delete" ON public.members;

CREATE POLICY "members_insert" ON public.members
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "members_update" ON public.members
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "members_delete" ON public.members
  FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "sponsors_insert" ON public.sponsors;
DROP POLICY IF EXISTS "sponsors_update" ON public.sponsors;
DROP POLICY IF EXISTS "sponsors_delete" ON public.sponsors;

CREATE POLICY "sponsors_insert" ON public.sponsors
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "sponsors_update" ON public.sponsors
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "sponsors_delete" ON public.sponsors
  FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "alumni_insert" ON public.alumni;
DROP POLICY IF EXISTS "alumni_update" ON public.alumni;
DROP POLICY IF EXISTS "alumni_delete" ON public.alumni;

CREATE POLICY "alumni_insert" ON public.alumni
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "alumni_update" ON public.alumni
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "alumni_delete" ON public.alumni
  FOR DELETE USING (public.is_admin());

-- ---- 4. Create storage buckets ----

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('project-images', 'project-images', true),
  ('member-photos',  'member-photos',  true),
  ('sponsor-logos',  'sponsor-logos',  true)
ON CONFLICT (id) DO NOTHING;

-- ---- 5. Storage object policies (use public.is_admin()) ----

DROP POLICY IF EXISTS "project-images public read" ON storage.objects;
DROP POLICY IF EXISTS "member-photos public read"  ON storage.objects;
DROP POLICY IF EXISTS "sponsor-logos public read"  ON storage.objects;

CREATE POLICY "project-images public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-images');
CREATE POLICY "member-photos public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'member-photos');
CREATE POLICY "sponsor-logos public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'sponsor-logos');

DROP POLICY IF EXISTS "project-images admin write"  ON storage.objects;
DROP POLICY IF EXISTS "project-images admin delete" ON storage.objects;
DROP POLICY IF EXISTS "member-photos admin write"   ON storage.objects;
DROP POLICY IF EXISTS "member-photos admin delete"  ON storage.objects;
DROP POLICY IF EXISTS "sponsor-logos admin write"   ON storage.objects;
DROP POLICY IF EXISTS "sponsor-logos admin delete"  ON storage.objects;

CREATE POLICY "project-images admin write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'project-images' AND public.is_admin());
CREATE POLICY "project-images admin delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'project-images' AND public.is_admin());

CREATE POLICY "member-photos admin write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'member-photos' AND public.is_admin());
CREATE POLICY "member-photos admin delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'member-photos' AND public.is_admin());

CREATE POLICY "sponsor-logos admin write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'sponsor-logos' AND public.is_admin());
CREATE POLICY "sponsor-logos admin delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'sponsor-logos' AND public.is_admin());
