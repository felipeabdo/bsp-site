CREATE TABLE IF NOT EXISTS music_instrument_settings (
  voice text PRIMARY KEY,
  pattern jsonb NOT NULL,
  sample_data text,
  sample_mime text,
  sample_name text,
  updated_at timestamp without time zone NOT NULL DEFAULT now()
);
