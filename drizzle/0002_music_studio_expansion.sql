ALTER TABLE music_instrument_settings
  ADD COLUMN IF NOT EXISTS sound_slots jsonb,
  ADD COLUMN IF NOT EXISTS composition jsonb;

CREATE TABLE IF NOT EXISTS music_sound_samples (
  voice text NOT NULL,
  slot_id text NOT NULL,
  sample_data text NOT NULL,
  sample_mime text NOT NULL,
  sample_name text NOT NULL,
  updated_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT music_sound_samples_voice_slot_idx UNIQUE (voice, slot_id)
);

CREATE TABLE IF NOT EXISTS music_assignments (
  id serial PRIMARY KEY,
  title text NOT NULL,
  recipient_member_id text NOT NULL,
  instrument text NOT NULL,
  bpm integer NOT NULL DEFAULT 92,
  pattern jsonb NOT NULL,
  composition jsonb,
  description text,
  assigned_by text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS music_assignments_recipient_idx ON music_assignments(recipient_member_id, created_at DESC);
