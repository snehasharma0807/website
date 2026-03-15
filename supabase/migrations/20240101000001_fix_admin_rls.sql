-- Fix infinite recursion in admins RLS policies.
--
-- The original policies used:
--   auth.email() IN (SELECT email FROM admins)
-- Querying `admins` triggers its own SELECT policy → infinite recursion.
--
-- Fix: a SECURITY DEFINER function reads `admins` bypassing RLS.

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins WHERE email = auth.email()
  );
$$;

-- ---- Drop old recursive policies on admins ----

DROP POLICY IF EXISTS "admins_select" ON admins;
DROP POLICY IF EXISTS "admins_insert" ON admins;
DROP POLICY IF EXISTS "admins_update" ON admins;
DROP POLICY IF EXISTS "admins_delete" ON admins;

-- ---- Recreate admins policies using is_admin() ----

CREATE POLICY "admins_select" ON admins
  FOR SELECT USING (is_admin());

CREATE POLICY "admins_insert" ON admins
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "admins_update" ON admins
  FOR UPDATE USING (is_admin());

CREATE POLICY "admins_delete" ON admins
  FOR DELETE USING (is_admin());

-- ---- Drop and recreate policies on other tables to use is_admin() ----

DROP POLICY IF EXISTS "projects_insert" ON projects;
DROP POLICY IF EXISTS "projects_update" ON projects;
DROP POLICY IF EXISTS "projects_delete" ON projects;

CREATE POLICY "projects_insert" ON projects
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "projects_update" ON projects
  FOR UPDATE USING (is_admin());

CREATE POLICY "projects_delete" ON projects
  FOR DELETE USING (is_admin());

DROP POLICY IF EXISTS "members_insert" ON members;
DROP POLICY IF EXISTS "members_update" ON members;
DROP POLICY IF EXISTS "members_delete" ON members;

CREATE POLICY "members_insert" ON members
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "members_update" ON members
  FOR UPDATE USING (is_admin());

CREATE POLICY "members_delete" ON members
  FOR DELETE USING (is_admin());

DROP POLICY IF EXISTS "sponsors_insert" ON sponsors;
DROP POLICY IF EXISTS "sponsors_update" ON sponsors;
DROP POLICY IF EXISTS "sponsors_delete" ON sponsors;

CREATE POLICY "sponsors_insert" ON sponsors
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "sponsors_update" ON sponsors
  FOR UPDATE USING (is_admin());

CREATE POLICY "sponsors_delete" ON sponsors
  FOR DELETE USING (is_admin());

DROP POLICY IF EXISTS "alumni_insert" ON alumni;
DROP POLICY IF EXISTS "alumni_update" ON alumni;
DROP POLICY IF EXISTS "alumni_delete" ON alumni;

CREATE POLICY "alumni_insert" ON alumni
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "alumni_update" ON alumni
  FOR UPDATE USING (is_admin());

CREATE POLICY "alumni_delete" ON alumni
  FOR DELETE USING (is_admin());
