CREATE TABLE usuarios (
  id                  SERIAL PRIMARY KEY,
  username            VARCHAR(80) NOT NULL UNIQUE,
  nome_usuario        VARCHAR(120) NOT NULL,
  cpf                 VARCHAR(14) NOT NULL UNIQUE,
  email               VARCHAR(150) NOT NULL UNIQUE,
  telefone            VARCHAR(20),
  senha_hash          VARCHAR(255) NOT NULL,
  ativo               BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_cpf ON usuarios(cpf);
