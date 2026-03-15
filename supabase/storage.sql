-- ============================================================
-- STORAGE BUCKETS
-- Run this in the Supabase SQL editor after applying migrations.
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('project-images', 'project-images', true),
  ('member-photos',  'member-photos',  true),
  ('sponsor-logos',  'sponsor-logos',  true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access on all three buckets

CREATE POLICY "project-images public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-images');

CREATE POLICY "member-photos public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'member-photos');

CREATE POLICY "sponsor-logos public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'sponsor-logos');

-- Allow admin upload/delete for all three buckets

CREATE POLICY "project-images admin write" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project-images'
    AND auth.email() IN (SELECT email FROM admins)
  );

CREATE POLICY "project-images admin delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'project-images'
    AND auth.email() IN (SELECT email FROM admins)
  );

CREATE POLICY "member-photos admin write" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'member-photos'
    AND auth.email() IN (SELECT email FROM admins)
  );

CREATE POLICY "member-photos admin delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'member-photos'
    AND auth.email() IN (SELECT email FROM admins)
  );

CREATE POLICY "sponsor-logos admin write" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'sponsor-logos'
    AND auth.email() IN (SELECT email FROM admins)
  );

CREATE POLICY "sponsor-logos admin delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'sponsor-logos'
    AND auth.email() IN (SELECT email FROM admins)
  );
