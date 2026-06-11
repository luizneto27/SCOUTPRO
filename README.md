# ScoutPro

Backend Java do ScoutPro (Spring Boot + PostgreSQL), com arquitetura limpa, migrations Flyway e autenticacao JWT.

## Estrutura do projeto

- `backend/`: API Java (Spring Boot 4)
- `docs/`: documentacao funcional e tecnica
- `docker-compose.yml`: sobe Postgres + backend

## Requisitos

- Docker Desktop

## Subir o ambiente

1. Copie variaveis de ambiente:

```bash
copy .env.example .env
```

`JWT_SECRET` e obrigatorio para subir o backend via Docker Compose.

2. Suba os servicos:

```bash
docker compose up -d --build
```

Servicos:

- Backend: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- PostgreSQL: `localhost:5432`

## Banco de dados e migrations

- Baseline: `backend/src/main/resources/db/migration/V1__baseline.sql`
- Usuarios/autenticacao: `backend/src/main/resources/db/migration/V2__create_usuarios.sql`
- Fonte de referencia do schema: `backend/src/main/resources/db/migration/V1__baseline.sql`

Regra obrigatoria: nunca alterar migration ja aplicada em ambiente compartilhado; sempre criar nova `Vx__...sql`.

## Autenticacao JWT

Fluxo:

1. No primeiro startup, o sistema cria automaticamente um usuario `ADMIN` (bootstrap).
2. Fazer login (`POST /api/v1/auth/login`) com o admin.
3. Com token do admin, criar outros usuarios (`POST /api/v1/usuarios`).
4. Usar token em `Authorization: Bearer <jwt>`.

Endpoints principais:

- `POST /api/v1/usuarios`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me` (protegido)

Variaveis de bootstrap do admin:
- `APP_ADMIN_USERNAME`
- `APP_ADMIN_PASSWORD`
- `APP_ADMIN_NOME`
- `APP_ADMIN_CPF`
- `APP_ADMIN_EMAIL`
- `APP_ADMIN_TELEFONE`

## Build local do backend

```bash
cd backend
mvn -DskipTests package
```

## Teste local (backend + banco local)

1. Suba somente o Postgres:

```bash
docker compose up -d postgres
```

2. Rode a API local com profile `local`:

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

3. Acesse:
- API: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger-ui/index.html`

Observacoes:
- O profile `local` usa `application-local.yml`.
- Flyway roda no startup e cria/atualiza schema automaticamente.
- Padrao local atual:
  - database: `scoutpro-project`
  - username: `scoutpro`
  - password: `scoutpro`
- Se quiser usar outro banco local, sobrescreva com:
  - `SPRING_DATASOURCE_URL`
  - `SPRING_DATASOURCE_USERNAME`
  - `SPRING_DATASOURCE_PASSWORD`
  - `JWT_SECRET`

Tambem ha fallback para ambientes como Azure Container Apps usando:
- `DB_HOST`
- `DB_PORT`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `DB_SSLMODE`
- `JWT_SECRET`

Precedencia:
- Se `SPRING_DATASOURCE_URL` estiver definida, ela vence.
- Caso contrario, a aplicacao monta a URL a partir de `DB_HOST`/`DB_PORT`/`POSTGRES_DB`/`DB_SSLMODE`.

## CI/CD

Workflow em `.github/workflows/build-push-acr.yml` para build e push de imagem no ACR.

Healthcheck opcional no GitHub Actions:
- Defina a repository variable `HEALTHCHECK_URL` com a URL publicada da aplicacao.
- Recomendado: `https://<seu-endpoint>/actuator/health`
- O workflow fara ate 30 tentativas com intervalo de 10 segundos e falhara se nao receber HTTP `200`.
