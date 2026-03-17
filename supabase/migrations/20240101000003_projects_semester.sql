-- Add semester/cohort for grouping projects (e.g. Fall 2025, Spring 2026)
-- Replaces use of status (active/archived) for organizing projects.

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS semester text;

COMMENT ON COLUMN projects.semester IS 'e.g. Fall 2025, Spring 2026; used to group projects by term.';
