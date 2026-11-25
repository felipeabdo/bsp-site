-- Operação da Área do Integrante: dados operacionais dos eventos, RSVP e mural.
-- Execute este arquivo no banco PostgreSQL antes de publicar a nova versão do site.

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS concentration_at TEXT,
  ADD COLUMN IF NOT EXISTS dress_code TEXT;

CREATE TABLE IF NOT EXISTS event_rsvps (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL REFERENCES users(member_id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('going', 'unavailable')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT event_rsvps_event_member_idx UNIQUE (event_id, member_id)
);

CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Diretoria',
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
