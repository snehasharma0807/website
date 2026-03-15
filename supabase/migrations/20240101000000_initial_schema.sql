-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS projects (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        text,
  description  text,
  image_url    text,
  github_link  text,
  demo_link    text,
  dev_team     text,
  tags         text[],
  status       text,
  created_at   timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS members (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             text,
  role             text,
  bio              text,
  photo_url        text,
  linkedin         text,
  github           text,
  graduation_year  text,
  created_at       timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sponsors (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text,
  logo_url    text,
  website     text,
  tier        text,
  created_at  timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alumni (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             text,
  graduation_year  text,
  created_at       timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admins (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       text UNIQUE,
  created_at  timestamp DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE projects  ENABLE ROW LEVEL SECURITY;
ALTER TABLE members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors  ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumni    ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins    ENABLE ROW LEVEL SECURITY;

-- ---- admins table: full CRUD for admins only ----

CREATE POLICY "admins_select" ON admins
  FOR SELECT USING (auth.email() IN (SELECT email FROM admins));

CREATE POLICY "admins_insert" ON admins
  FOR INSERT WITH CHECK (auth.email() IN (SELECT email FROM admins));

CREATE POLICY "admins_update" ON admins
  FOR UPDATE USING (auth.email() IN (SELECT email FROM admins));

CREATE POLICY "admins_delete" ON admins
  FOR DELETE USING (auth.email() IN (SELECT email FROM admins));

-- ---- projects: public SELECT, admin write ----

CREATE POLICY "projects_select" ON projects
  FOR SELECT USING (true);

CREATE POLICY "projects_insert" ON projects
  FOR INSERT WITH CHECK (auth.email() IN (SELECT email FROM admins));

CREATE POLICY "projects_update" ON projects
  FOR UPDATE USING (auth.email() IN (SELECT email FROM admins));

CREATE POLICY "projects_delete" ON projects
  FOR DELETE USING (auth.email() IN (SELECT email FROM admins));

-- ---- members: public SELECT, admin write ----

CREATE POLICY "members_select" ON members
  FOR SELECT USING (true);

CREATE POLICY "members_insert" ON members
  FOR INSERT WITH CHECK (auth.email() IN (SELECT email FROM admins));

CREATE POLICY "members_update" ON members
  FOR UPDATE USING (auth.email() IN (SELECT email FROM admins));

CREATE POLICY "members_delete" ON members
  FOR DELETE USING (auth.email() IN (SELECT email FROM admins));

-- ---- sponsors: public SELECT, admin write ----

CREATE POLICY "sponsors_select" ON sponsors
  FOR SELECT USING (true);

CREATE POLICY "sponsors_insert" ON sponsors
  FOR INSERT WITH CHECK (auth.email() IN (SELECT email FROM admins));

CREATE POLICY "sponsors_update" ON sponsors
  FOR UPDATE USING (auth.email() IN (SELECT email FROM admins));

CREATE POLICY "sponsors_delete" ON sponsors
  FOR DELETE USING (auth.email() IN (SELECT email FROM admins));

-- ---- alumni: public SELECT, admin write ----

CREATE POLICY "alumni_select" ON alumni
  FOR SELECT USING (true);

CREATE POLICY "alumni_insert" ON alumni
  FOR INSERT WITH CHECK (auth.email() IN (SELECT email FROM admins));

CREATE POLICY "alumni_update" ON alumni
  FOR UPDATE USING (auth.email() IN (SELECT email FROM admins));

CREATE POLICY "alumni_delete" ON alumni
  FOR DELETE USING (auth.email() IN (SELECT email FROM admins));
