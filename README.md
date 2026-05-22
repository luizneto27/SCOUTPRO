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

---

## CRUD básico em Python (local)

Foi adicionado um CRUD simples em Flask no arquivo `app.py` para:

- Jogadores (`/jogadores`)
- Relatórios de observação de partidas (`/relatorios`)
- Estatísticas (`/estatisticas`)
- Cadastros de apoio: scouts, clubes e competições (`/scouts`, `/clubes`, `/competicoes`)
- Consulta de catálogos: países e posições (`/paises`, `/posicoes`)

### Rodar local

1. Instale as dependências:
```bash
pip install -r requirements.txt
```

2. Suba o banco:
```bash
docker compose up -d
```

3. Rode a API:
```bash
python app.py
```

API local: `http://localhost:5000`

### Variáveis de ambiente (docker-compose)

Defina no ambiente (ou em `.env` local, sem versionar):

```env
DB_HOST=seu-host-postgres
DB_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=seu-usuario
POSTGRES_PASSWORD=sua-senha
DB_SSLMODE=require
```

### Exemplos rápidos (PowerShell)

Criar jogador:
```powershell
$body = @{
  nome = "Joao Silva"
  nome_completo = "Joao Pedro da Silva"
  data_nascimento = "2004-05-10"
  pais_id = 1
  posicao_id = 10
  pe_dominante = "D"
  ativo = $true
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:5000/jogadores" -ContentType "application/json" -Body $body
```

Criar relatório:
```powershell
$body = @{
  jogador_id = 1
  scout_id = 1
  clube_id = 1
  competicao_id = 1
  data_observacao = "2026-05-20"
  local = "Sao Paulo"
  tecnica = 7.5
  tatica = 7.0
  fisico = 8.0
  mentalidade = 7.5
  potencial = 8.5
  recomendacao = "MONITORAR"
  observacoes = "Bom desempenho geral."
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:5000/relatorios" -ContentType "application/json" -Body $body
```

Criar estatística:
```powershell
$body = @{
  jogador_id = 1
  clube_id = 1
  competicao_id = 1
  temporada = "2025/2026"
  jogos = 30
  minutos = 2100
  titularidades = 24
  gols = 12
  assistencias = 5
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:5000/estatisticas" -ContentType "application/json" -Body $body
```

### Endpoints de apoio (detalhado)

`GET` de catálogos:

- `GET http://localhost:5000/paises`
- `GET http://localhost:5000/posicoes`

`GET/POST` de apoio:

- `GET http://localhost:5000/scouts`
- `POST http://localhost:5000/scouts`
- `GET http://localhost:5000/clubes`
- `POST http://localhost:5000/clubes`
- `GET http://localhost:5000/competicoes`
- `POST http://localhost:5000/competicoes`

Criar scout:
```powershell
$body = @{
  nome = "Carlos Mendes"
  email = "carlos.mendes@scoutpro.com"
  regiao = "Nordeste"
  ativo = $true
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:5000/scouts" -ContentType "application/json" -Body $body
```

Criar clube:
```powershell
$body = @{
  nome = "Fortaleza EC"
  pais_id = 1
  cidade = "Fortaleza"
  fundacao = "1918-10-18"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:5000/clubes" -ContentType "application/json" -Body $body
```

Criar competição:
```powershell
$body = @{
  nome = "Copa do Nordeste"
  pais_id = 1
  nivel = 1
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:5000/competicoes" -ContentType "application/json" -Body $body
```

---

## Build e Push no ACR com GitHub Actions

Workflow criado em `.github/workflows/build-push-acr.yml`.

Adicione estes secrets em `Settings > Secrets and variables > Actions`:

- `AZURE_ACR_USERNAME`
- `AZURE_ACR_PASSWORD`
- `AZURE_ACR_LOGIN_SERVER` (ex.: `meuacr.azurecr.io`)

O workflow:
- Faz login no ACR via `docker/login-action@v3`
- Builda a imagem Docker
- Publica tags `latest` e `${{ github.sha }}`
