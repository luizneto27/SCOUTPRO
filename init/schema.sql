CREATE TABLE paises (
  id        SERIAL PRIMARY KEY,
  nome      VARCHAR(100) NOT NULL,
  sigla     CHAR(3) NOT NULL UNIQUE
);

CREATE TABLE posicoes (
  id        SERIAL PRIMARY KEY,
  nome      VARCHAR(50) NOT NULL,   
  sigla     VARCHAR(5) NOT NULL     
);

CREATE TABLE clubes (
  id         SERIAL PRIMARY KEY,
  nome       VARCHAR(100) NOT NULL,
  pais_id    INT REFERENCES paises(id),
  cidade     VARCHAR(100),
  fundacao   DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE competicoes (
  id        SERIAL PRIMARY KEY,
  nome      VARCHAR(100) NOT NULL,   
  pais_id   INT REFERENCES paises(id),
  nivel     INT DEFAULT 1            
);

CREATE TABLE jogadores (
  id              SERIAL PRIMARY KEY,
  nome            VARCHAR(100) NOT NULL,
  nome_completo   VARCHAR(200),
  data_nascimento DATE,
  pais_id         INT REFERENCES paises(id),
  posicao_id      INT REFERENCES posicoes(id),
  posicao_sec_id  INT REFERENCES posicoes(id),  
  altura_cm       SMALLINT,
  peso_kg         SMALLINT,
  pe_dominante    CHAR(1) CHECK (pe_dominante IN ('D', 'E', 'A')), 
  clube_atual_id  INT REFERENCES clubes(id),
  ativo           BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE scouts (
  id         SERIAL PRIMARY KEY,
  nome       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) UNIQUE NOT NULL,
  regiao     VARCHAR(100),    
  ativo      BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE relatorios (
  id           SERIAL PRIMARY KEY,
  jogador_id   INT NOT NULL REFERENCES jogadores(id),
  scout_id     INT NOT NULL REFERENCES scouts(id),
  clube_id     INT REFERENCES clubes(id),       
  competicao_id INT REFERENCES competicoes(id),
  data_observacao DATE NOT NULL,
  local        VARCHAR(200),                    

  tecnica          NUMERIC(4,1) CHECK (tecnica BETWEEN 0 AND 10),
  tatica           NUMERIC(4,1) CHECK (tatica BETWEEN 0 AND 10),
  fisico           NUMERIC(4,1) CHECK (fisico BETWEEN 0 AND 10),
  mentalidade      NUMERIC(4,1) CHECK (mentalidade BETWEEN 0 AND 10),
  potencial        NUMERIC(4,1) CHECK (potencial BETWEEN 0 AND 10),

  nota_geral       NUMERIC(4,1) GENERATED ALWAYS AS (
    ROUND((tecnica + tatica + fisico + mentalidade + potencial) / 5.0, 1)
  ) STORED,

  recomendacao     VARCHAR(20) CHECK (recomendacao IN ('CONTRATAR', 'MONITORAR', 'DESCARTAR')),

  observacoes      TEXT,
  created_at       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE estatisticas (
  id             SERIAL PRIMARY KEY,
  jogador_id     INT NOT NULL REFERENCES jogadores(id),
  clube_id       INT NOT NULL REFERENCES clubes(id),
  competicao_id  INT REFERENCES competicoes(id),
  temporada      CHAR(9) NOT NULL,       

  jogos          SMALLINT DEFAULT 0,
  minutos        INT DEFAULT 0,
  titularidades  SMALLINT DEFAULT 0,

  gols           SMALLINT DEFAULT 0,
  assistencias   SMALLINT DEFAULT 0,
  chutes         SMALLINT DEFAULT 0,
  chutes_gol     SMALLINT DEFAULT 0,

  interceptacoes SMALLINT DEFAULT 0,
  desarmes       SMALLINT DEFAULT 0,

  amarelos       SMALLINT DEFAULT 0,
  vermelhos      SMALLINT DEFAULT 0,

  created_at     TIMESTAMP DEFAULT NOW(),

  UNIQUE (jogador_id, clube_id, competicao_id, temporada)
);

INSERT INTO paises (nome, sigla) VALUES
  ('Brasil', 'BRA'),
  ('Argentina', 'ARG'),
  ('Portugal', 'POR'),
  ('Espanha', 'ESP'),
  ('França', 'FRA'),
  ('Alemanha', 'ALE'),
  ('Itália', 'ITA');

INSERT INTO posicoes (nome, sigla) VALUES
  ('Goleiro', 'GOL'),
  ('Lateral Direito', 'LD'),
  ('Lateral Esquerdo', 'LE'),
  ('Zagueiro', 'ZAG'),
  ('Volante', 'VOL'),
  ('Meia Central', 'MC'),
  ('Meia Atacante', 'MEI'),
  ('Ponta Direita', 'PD'),
  ('Ponta Esquerda', 'PE'),
  ('Centroavante', 'CA');

INSERT INTO competicoes (nome, pais_id, nivel) VALUES
  ('Brasileirão Série A', 1, 1),
  ('Brasileirão Série B', 1, 2),
  ('Copa do Brasil', 1, 1),
  ('Campeonato Paulista', 1, 1),
  ('Campeonato Carioca', 1, 1);
