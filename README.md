# ScoutPro — Banco de Dados

Banco de dados PostgreSQL para scouting e análise de desempenho de jogadores de futebol.

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado

## Como usar

### 1. Clone o repositório
```bash
git clone https://github.com/luizneto27/SCOUTPRO
cd scoutpro
```

### 2. Crie o arquivo `.env`
```bash
copy .env.example .env
```

> Edite o `.env` se quiser mudar usuário ou senha.

### 3. Suba o banco
```bash
docker compose up -d
```

O banco já sobe com as tabelas criadas automaticamente.

### 4. Conecte no DBeaver

| Campo    | Valor       |
|----------|-------------|
| Host     | `localhost` |
| Port     | `5432`      |
| Database | `scoutpro`  |
| Username | `admin`     |
| Password | `admin123`  |

---

## Estrutura das tabelas

```
paises          → países dos jogadores e clubes
posicoes        → posições em campo
clubes          → times / clubes
competicoes     → ligas e torneios
jogadores       → cadastro dos jogadores
scouts          → observadores/analistas
relatorios      → avaliações feitas pelos scouts
estatisticas    → stats por temporada/competição
```