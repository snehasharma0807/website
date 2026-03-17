-- Extended project fields for full project page content

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS title_abbrev text,
  ADD COLUMN IF NOT EXISTS about_project text,
  ADD COLUMN IF NOT EXISTS about_client text,
  ADD COLUMN IF NOT EXISTS impact text,
  ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS team_members jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS testimonials jsonb DEFAULT '[]';

COMMENT ON COLUMN projects.title_abbrev IS 'e.g. GOGO for Guitars Over Guns (GOGO)';
COMMENT ON COLUMN projects.features IS 'Array of { header, body, image_url }';
COMMENT ON COLUMN projects.team_members IS 'Array of { name, title, image_url, linkedin, role: "lead"|"developer" }';
COMMENT ON COLUMN projects.testimonials IS 'Array of { author, quote }';
