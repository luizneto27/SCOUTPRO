CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE jogadores
  ADD COLUMN IF NOT EXISTS perfil_texto TEXT,
  ADD COLUMN IF NOT EXISTS perfil_vetor vector(768);

CREATE INDEX IF NOT EXISTS idx_jogadores_perfil_vetor_cosine
  ON jogadores
  USING ivfflat (perfil_vetor vector_cosine_ops)
  WITH (lists = 100);
