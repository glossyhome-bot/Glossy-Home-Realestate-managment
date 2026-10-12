-- Run this once in the Neon SQL Editor for the Glossy Home project.
CREATE TABLE IF NOT EXISTS glossy_home_app_state (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text NOT NULL
);
