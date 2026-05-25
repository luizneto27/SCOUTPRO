-- Schema normalizado (proposta)

-- =========================
-- Tabelas de dominio/base
-- =========================
CREATE TABLE paises (
  id         SERIAL PRIMARY KEY,
  nome       VARCHAR(100) NOT NULL,
  sigla      CHAR(3) NOT NULL UNIQUE
);

CREATE TABLE posicoes (
  id         SERIAL PRIMARY KEY,
  nome       VARCHAR(50) NOT NULL,
  sigla      VARCHAR(5) NOT NULL UNIQUE
);

CREATE TABLE marcas (
  id         SERIAL PRIMARY KEY,
  nome       VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE empresarios (
  id                    SERIAL PRIMARY KEY,
  nome_empresarial      VARCHAR(100) NOT NULL,
  created_at            TIMESTAMP DEFAULT NOW()
);

CREATE TABLE clubes (
  id         SERIAL PRIMARY KEY,
  cnpj       VARCHAR(20) UNIQUE NOT NULL,
  nome       VARCHAR(100) NOT NULL,
  pais_id    INT REFERENCES paises(id),
  cidade     VARCHAR(100),
  fundacao   DATE,
  orcamento  NUMERIC(15,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE clientes (
  id         SERIAL PRIMARY KEY,
  nome       VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE scouts (
  id         SERIAL PRIMARY KEY,
  nome       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) UNIQUE NOT NULL,
  regiao     VARCHAR(100),
  ativo      BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE scout_autonomo_detalhes (
  scout_id       INT PRIMARY KEY REFERENCES scouts(id) ON DELETE CASCADE,
  cnpj           VARCHAR(20) UNIQUE NOT NULL,
  especialidade  VARCHAR(100),
  created_at     TIMESTAMP DEFAULT NOW()
);

-- =========================
-- Competicao e temporada
-- =========================
CREATE TABLE competicoes (
  id                    SERIAL PRIMARY KEY,
  nome                  VARCHAR(100) NOT NULL,
  pais_id               INT REFERENCES paises(id),
  tipo_campeonato       VARCHAR(50),
  created_at            TIMESTAMP DEFAULT NOW(),
  UNIQUE (nome, pais_id, tipo_campeonato)
);

CREATE TABLE competicoes_edicoes (
  id                    SERIAL PRIMARY KEY,
  competicao_id         INT NOT NULL REFERENCES competicoes(id) ON DELETE CASCADE,
  temporada             CHAR(9) NOT NULL,
  divisao               INT DEFAULT 1,
  ranking               INT,
  created_at            TIMESTAMP DEFAULT NOW(),
  UNIQUE (competicao_id, temporada)
);

-- =========================
-- Jogadores e especializacao
-- =========================
CREATE TABLE jogadores (
  id                    SERIAL PRIMARY KEY,
  nome                  VARCHAR(100) NOT NULL,
  nome_completo         VARCHAR(200),
  data_nascimento       DATE,
  pais_id               INT REFERENCES paises(id),
  valor_mercado         NUMERIC(15,2),
  titulos               INT DEFAULT 0,
  altura_cm             SMALLINT,
  peso_kg               SMALLINT,
  pe_dominante          CHAR(1) CHECK (pe_dominante IN ('D', 'E', 'A')),
  id_empresario         INT REFERENCES empresarios(id),
  ativo                 BOOLEAN DEFAULT TRUE,
  tipo_jogador          VARCHAR(20) CHECK (tipo_jogador IN ('GOLEIRO', 'JOGADOR_LINHA')) NOT NULL DEFAULT 'JOGADOR_LINHA',
  created_at            TIMESTAMP DEFAULT NOW()
);

CREATE TABLE jogador_posicoes (
  jogador_id            INT NOT NULL REFERENCES jogadores(id) ON DELETE CASCADE,
  posicao_id            INT NOT NULL REFERENCES posicoes(id),
  ordem                 SMALLINT NOT NULL CHECK (ordem >= 1),
  created_at            TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (jogador_id, posicao_id),
  UNIQUE (jogador_id, ordem)
);

CREATE TABLE goleiros (
  id_jogador            INT PRIMARY KEY REFERENCES jogadores(id) ON DELETE CASCADE,
  gols_sofridos         INT DEFAULT 0,
  reposicoes            INT DEFAULT 0,
  penaltis_defendidos   INT DEFAULT 0,
  defesas_dificeis      INT DEFAULT 0,
  jogos_sem_sofrer_gol  INT DEFAULT 0,
  created_at            TIMESTAMP DEFAULT NOW()
);

CREATE TABLE jogadores_linha (
  id_jogador            INT PRIMARY KEY REFERENCES jogadores(id) ON DELETE CASCADE,
  gols                  INT DEFAULT 0,
  desarmes              INT DEFAULT 0,
  cartoes_amarelos      INT DEFAULT 0,
  cartoes_vermelhos     INT DEFAULT 0,
  passes_chave          INT DEFAULT 0,
  km_percorridos        NUMERIC(8,2) DEFAULT 0,
  nota_media            NUMERIC(3,1),
  minutos_jogados       INT DEFAULT 0,
  faltas_sofridas       INT DEFAULT 0,
  faltas_cometidas      INT DEFAULT 0,
  impedimentos          INT DEFAULT 0,
  finalizacoes_gol      INT DEFAULT 0,
  created_at            TIMESTAMP DEFAULT NOW()
);

-- =========================
-- Vinculos e historicos
-- =========================
CREATE TABLE contratos (
  id                    SERIAL PRIMARY KEY,
  id_jogador            INT NOT NULL REFERENCES jogadores(id),
  clube_id              INT NOT NULL REFERENCES clubes(id),
  valor_contrato        NUMERIC(15,2),
  tempo_contrato        INT,
  multa_rescisoria      NUMERIC(15,2),
  data_inicio           DATE NOT NULL,
  data_fim              DATE,
  ativo                 BOOLEAN DEFAULT TRUE,
  created_at            TIMESTAMP DEFAULT NOW(),
  CHECK (data_fim IS NULL OR data_fim >= data_inicio)
);

-- Um unico contrato ativo por jogador
CREATE UNIQUE INDEX uq_contrato_ativo_jogador
  ON contratos(id_jogador)
  WHERE ativo = TRUE;

CREATE TABLE transferencias (
  id                    SERIAL PRIMARY KEY,
  data_transferencia    DATE NOT NULL,
  valor_pago            NUMERIC(15,2),
  tipo                  VARCHAR(50),
  id_jogador            INT NOT NULL REFERENCES jogadores(id),
  clube_origem_id       INT NOT NULL REFERENCES clubes(id),
  clube_destino_id      INT NOT NULL REFERENCES clubes(id),
  created_at            TIMESTAMP DEFAULT NOW(),
  CHECK (clube_origem_id <> clube_destino_id)
);

CREATE TABLE realiza (
  scout_id              INT NOT NULL REFERENCES scout_autonomo_detalhes(scout_id),
  id_transferencia      INT NOT NULL REFERENCES transferencias(id),
  PRIMARY KEY (scout_id, id_transferencia)
);

-- =========================
-- Patrocinio
-- =========================
CREATE TABLE jogador_patrocinios (
  jogador_id            INT NOT NULL REFERENCES jogadores(id),
  marca_id              INT NOT NULL REFERENCES marcas(id),
  data_inicio           DATE,
  data_fim              DATE,
  created_at            TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (jogador_id, marca_id, data_inicio),
  CHECK (data_fim IS NULL OR data_inicio IS NULL OR data_fim >= data_inicio)
);

-- =========================
-- Monitoramento e observacao
-- =========================
CREATE TABLE monitora (
  id_cliente            INT NOT NULL REFERENCES clientes(id),
  id_jogador            INT NOT NULL REFERENCES jogadores(id),
  data_inicio_monitoramento DATE NOT NULL,
  PRIMARY KEY (id_cliente, id_jogador)
);

CREATE TABLE relatorios (
  id                    SERIAL PRIMARY KEY,
  jogador_id            INT NOT NULL REFERENCES jogadores(id),
  scout_id              INT NOT NULL REFERENCES scouts(id),
  clube_id              INT REFERENCES clubes(id),
  competicao_edicao_id  INT REFERENCES competicoes_edicoes(id),
  data_observacao       DATE NOT NULL,
  local                 VARCHAR(200),
  tecnica               NUMERIC(4,1) CHECK (tecnica BETWEEN 0 AND 10),
  tatica                NUMERIC(4,1) CHECK (tatica BETWEEN 0 AND 10),
  fisico                NUMERIC(4,1) CHECK (fisico BETWEEN 0 AND 10),
  mentalidade           NUMERIC(4,1) CHECK (mentalidade BETWEEN 0 AND 10),
  potencial             NUMERIC(4,1) CHECK (potencial BETWEEN 0 AND 10),
  nota_geral            NUMERIC(4,1) GENERATED ALWAYS AS (
    ROUND((tecnica + tatica + fisico + mentalidade + potencial) / 5.0, 1)
  ) STORED,
  recomendacao          VARCHAR(20) CHECK (recomendacao IN ('CONTRATAR', 'MONITORAR', 'DESCARTAR')),
  observacoes           TEXT,
  created_at            TIMESTAMP DEFAULT NOW()
);

-- =========================
-- Partidas e desempenho
-- =========================
CREATE TABLE partidas (
  id                    SERIAL PRIMARY KEY,
  data                  DATE NOT NULL,
  competicao_edicao_id  INT NOT NULL REFERENCES competicoes_edicoes(id),
  created_at            TIMESTAMP DEFAULT NOW()
);

CREATE TABLE partida_clubes (
  partida_id            INT NOT NULL REFERENCES partidas(id) ON DELETE CASCADE,
  clube_id              INT NOT NULL REFERENCES clubes(id),
  mando                 VARCHAR(10) NOT NULL CHECK (mando IN ('MANDANTE', 'VISITANTE')),
  gols                  SMALLINT NOT NULL DEFAULT 0 CHECK (gols >= 0),
  PRIMARY KEY (partida_id, clube_id),
  UNIQUE (partida_id, mando)
);

CREATE TABLE disputa (
  id_jogador                    INT NOT NULL REFERENCES jogadores(id),
  id_partida                    INT NOT NULL REFERENCES partidas(id),
  gols_partida                  INT DEFAULT 0,
  finalizacoes_gol_partida      INT DEFAULT 0,
  faltas_cometidas_partida      INT DEFAULT 0,
  faltas_sofridas_partida       INT DEFAULT 0,
  cartoes_amarelos_partida      INT DEFAULT 0,
  cartoes_vermelhos_partida     INT DEFAULT 0,
  impedimentos_partida          INT DEFAULT 0,
  km_percorridos_partida        NUMERIC(8,2) DEFAULT 0,
  desarmes_partida              INT DEFAULT 0,
  passes_chave_partida          INT DEFAULT 0,
  minutos_jogados_partida       INT DEFAULT 0,
  nota_partida                  NUMERIC(3,1),
  reposicoes_partida            INT DEFAULT 0,
  gols_sofridos_partida         INT DEFAULT 0,
  penaltis_defendidos_partida   INT DEFAULT 0,
  defesas_dificeis_partida      INT DEFAULT 0,
  clean_sheet_partida           BOOLEAN DEFAULT FALSE,
  created_at                    TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (id_jogador, id_partida)
);

CREATE TABLE lesoes (
  id                    SERIAL PRIMARY KEY,
  data_lesao            DATE NOT NULL,
  tipo_lesao            VARCHAR(100) NOT NULL,
  gravidade             VARCHAR(20) CHECK (gravidade IN ('LEVE', 'MODERADA', 'GRAVE')),
  status_recuperacao    VARCHAR(20) CHECK (status_recuperacao IN ('EM_RECUPERACAO', 'RECUPERADO', 'RECAIDA')),
  tempo_recuperacao     INT,
  id_jogador            INT NOT NULL REFERENCES jogadores(id),
  created_at            TIMESTAMP DEFAULT NOW()
);

-- =========================
-- Estatisticas por temporada
-- =========================
CREATE TABLE estatisticas (
  id                    SERIAL PRIMARY KEY,
  jogador_id            INT NOT NULL REFERENCES jogadores(id),
  clube_id              INT NOT NULL REFERENCES clubes(id),
  competicao_edicao_id  INT REFERENCES competicoes_edicoes(id),
  jogos                 SMALLINT DEFAULT 0,
  minutos               INT DEFAULT 0,
  titularidades         SMALLINT DEFAULT 0,
  gols                  SMALLINT DEFAULT 0,
  assistencias          SMALLINT DEFAULT 0,
  chutes                SMALLINT DEFAULT 0,
  chutes_gol            SMALLINT DEFAULT 0,
  interceptacoes        SMALLINT DEFAULT 0,
  desarmes              SMALLINT DEFAULT 0,
  amarelos              SMALLINT DEFAULT 0,
  vermelhos             SMALLINT DEFAULT 0,
  created_at            TIMESTAMP DEFAULT NOW(),
  UNIQUE (jogador_id, clube_id, competicao_edicao_id)
);

-- =========================
-- Indices
-- =========================
CREATE INDEX idx_jogadores_pais ON jogadores(pais_id);
CREATE INDEX idx_jogadores_empresario ON jogadores(id_empresario);
CREATE INDEX idx_jogadores_tipo ON jogadores(tipo_jogador);
CREATE INDEX idx_jogador_posicoes_jogador ON jogador_posicoes(jogador_id);
CREATE INDEX idx_contratos_jogador ON contratos(id_jogador);
CREATE INDEX idx_contratos_clube ON contratos(clube_id);
CREATE INDEX idx_contratos_ativo ON contratos(ativo);
CREATE INDEX idx_partidas_competicao_edicao ON partidas(competicao_edicao_id);
CREATE INDEX idx_disputa_jogador ON disputa(id_jogador);
CREATE INDEX idx_disputa_partida ON disputa(id_partida);
CREATE INDEX idx_lesoes_jogador ON lesoes(id_jogador);
CREATE INDEX idx_transferencias_jogador ON transferencias(id_jogador);
CREATE INDEX idx_relatorios_jogador ON relatorios(jogador_id);
CREATE INDEX idx_relatorios_scout ON relatorios(scout_id);
CREATE INDEX idx_monitora_cliente ON monitora(id_cliente);
CREATE INDEX idx_monitora_jogador ON monitora(id_jogador);
