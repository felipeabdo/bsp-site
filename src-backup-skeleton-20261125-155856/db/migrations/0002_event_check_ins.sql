-- Registro de entrada de integrantes nos eventos por leitura do QR da carteirinha.
-- Execute este arquivo no PostgreSQL antes de publicar a versão com o leitor.

CREATE TABLE IF NOT EXISTS event_check_ins (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scanned_by INTEGER NOT NULL REFERENCES users(id),
  scanned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT event_check_ins_event_user_idx UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS event_check_ins_scanned_at_idx
  ON event_check_ins (scanned_at DESC);
