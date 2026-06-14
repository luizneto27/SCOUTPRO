# ScoutPro

Backend do ScoutPro construído com Java 21, Spring Boot 4, PostgreSQL, Flyway e autenticação JWT.

## Estado atual da arquitetura

O repositório está organizado com foco em backend e versionamento do schema:

- `backend/`: aplicação Spring Boot.
- `backend/src/main/java/com/scoutpro/backend/config/security`: configuração de segurança, JWT e bootstrap do admin.
- `backend/src/main/java/com/scoutpro/backend/application`: serviços de aplicação.
- `backend/src/main/java/com/scoutpro/backend/domain`: enums e contratos de domínio já refletidos do banco.
- `backend/src/main/java/com/scoutpro/backend/infrastructure/persistence`: entidades JPA e repositórios.
- `backend/src/main/java/com/scoutpro/backend/infrastructure/web`: controllers e DTOs HTTP.
- `backend/src/main/resources/db/migration`: migrations Flyway geradas a partir dos SQLs oficiais em `docs/`.
- `docs/`: documentação técnica e de contexto.
- `AGENTS.md`: guia operacional para agentes de IA seguirem padrões e fluxo do projeto.

Hoje a API implementada cobre principalmente:

- autenticação JWT;
- bootstrap automático de um usuário `ADMIN` no primeiro startup;
- criação de usuários protegida por role `ADMIN`;
- mapeamento JPA do domínio relacional principal já existente no baseline.

Endpoints já disponíveis:

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/usuarios`
- `GET /actuator/health`
- `GET /swagger-ui/index.html`
- `GET /v3/api-docs`

## Stack

- Java 21
- Spring Boot 4
- Spring Web
- Spring Data JPA
- Spring Security
- JWT
- Flyway
- PostgreSQL
- Springdoc OpenAPI
- Testcontainers para testes de integração

## Requisitos para rodar localmente

- Java 21
- Maven 3.9+
- Docker Desktop

## Como subir localmente

### Opção 1: stack completa com Docker Compose

1. Copie o arquivo de ambiente:

```bash
copy .env.example .env
```

2. Gere um valor forte para `JWT_SECRET` e preencha no `.env`.

Exemplo em PowerShell para gerar uma chave aleatória em Base64:

```powershell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 } | ForEach-Object { [byte]$_ }))
```

Exemplo de preenchimento no `.env`:

```env
JWT_SECRET=cole-aqui-a-chave-gerada
```

Boas práticas:

- use um valor longo e aleatório;
- não reutilize segredos entre ambientes;
- não commite o `.env` com segredo real no repositório.

3. Suba os serviços:

```bash
docker compose up -d --build
```

4. Acesse a aplicação:

- API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI: `http://localhost:8080/v3/api-docs`
- Healthcheck: `http://localhost:8080/actuator/health`
- PostgreSQL: `localhost:5432`

5. Para acompanhar logs:

```bash
docker compose logs -f backend
```

6. Para derrubar o ambiente:

```bash
docker compose down
```

### Opção 2: banco em Docker + backend rodando local pelo Maven

1. Suba apenas o PostgreSQL:

```bash
docker compose up -d postgres
```

2. Rode a aplicação com o profile local:

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

3. Acesse:

- API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`

O profile `local` usa `backend/src/main/resources/application-local.yml` e, por padrão, tenta conectar em:

- database: `scoutpro-project`
- usuário: `scoutpro`
- senha: `scoutpro`

Se quiser reutilizar o banco do `docker-compose.yml`, defina as variáveis antes de subir a aplicação local.

Exemplo em PowerShell:

```bash
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/scoutpro"
$env:SPRING_DATASOURCE_USERNAME="admin"
$env:SPRING_DATASOURCE_PASSWORD="admin123"
$env:JWT_SECRET="change-me-change-me-change-me-change-me"
```

## Variáveis de ambiente relevantes

Infra e banco:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `DB_HOST`
- `DB_PORT`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `DB_SSLMODE`

Segurança:

- `JWT_SECRET`
- `JWT_EXPIRATION_SECONDS`

Como gerar `JWT_SECRET`:

- PowerShell:

```powershell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 } | ForEach-Object { [byte]$_ }))
```

- OpenSSL:

```bash
openssl rand -base64 64
```

O valor gerado deve ser copiado para a variável `JWT_SECRET` no `.env` ou nas variáveis de ambiente da máquina/container.

Bootstrap do admin:

- `APP_ADMIN_USERNAME`
- `APP_ADMIN_PASSWORD`
- `APP_ADMIN_NOME`
- `APP_ADMIN_CPF`
- `APP_ADMIN_EMAIL`
- `APP_ADMIN_TELEFONE`

Precedência de datasource:

1. `SPRING_DATASOURCE_URL`
2. montagem via `DB_HOST` + `DB_PORT` + `POSTGRES_DB` + `DB_SSLMODE`
3. defaults do `application-local.yml`

## Fluxo inicial de uso

1. Suba a aplicação.
2. O bootstrap cria automaticamente um usuário `ADMIN` caso ainda não exista nenhum admin.
3. Faça login em `POST /api/v1/auth/login`.
4. Use o JWT retornado no header `Authorization: Bearer <token>`.
5. Com esse token, crie outros usuários em `POST /api/v1/usuarios`.

Exemplo de login para obter o token:

```bash
curl -X POST http://localhost:8080/api/v1/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

Resposta esperada:

```json
{
  "accessToken": "jwt-aqui",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

Exemplo para consultar o usuário autenticado:

```bash
curl http://localhost:8080/api/v1/auth/me -H "Authorization: Bearer jwt-aqui"
```

Exemplo para criar outro usuário com token de admin:

```bash
curl -X POST http://localhost:8080/api/v1/usuarios -H "Content-Type: application/json" -H "Authorization: Bearer jwt-aqui" -d "{\"username\":\"operador1\",\"nomeUsuario\":\"Operador 1\",\"cpf\":\"12345678901\",\"email\":\"operador1@scoutpro.local\",\"telefone\":\"85999999999\",\"senha\":\"senha123\"}"
```

## Uso do Flyway

O projeto usa Flyway como mecanismo obrigatório de evolução do schema.

Neste repositório, o uso do Flyway é feito no startup da aplicação. Não há plugin Maven de migração configurado para execução separada.

Schema adotado:

- o projeto assume uso do schema `public` no PostgreSQL;
- as migrations Flyway são aplicadas no `public`;
- o mapeamento JPA também espera as tabelas no `public`.

Implicação prática:

- o banco local precisa manter o schema `public` disponível;
- se o banco estiver vazio, as tabelas serão criadas pelas migrations nesse schema;
- se o ambiente usar outro schema, a configuração atual do projeto não está preparada para isso.

Fontes oficiais do schema:

- `docs/schema_normalized.sql`
- `docs/semantic_search_migration.sql`

Localização das migrations geradas a partir desses SQLs:

- `backend/src/main/resources/db/migration`

Migrations atuais:

- `V1__baseline.sql`: baseline consolidado do schema normalizado e autenticação.
- `V2__semantic_search.sql`: extensão `vector` e estrutura de busca semântica em `jogadores`.

Regras de uso:

- nunca editar uma migration já aplicada em ambiente compartilhado;
- toda mudança de schema deve entrar em uma nova `Vx__descricao.sql`;
- manter `spring.jpa.hibernate.ddl-auto=validate`;
- não usar `ddl-auto=create` ou `ddl-auto=update` como estratégia de evolução.

Fluxo recomendado para alterar o banco:

1. criar uma nova migration em `backend/src/main/resources/db/migration`;
2. ajustar entidades JPA, repositórios e serviços para refletir o novo schema;
3. subir a aplicação e deixar o Flyway aplicar a migration no startup;
4. validar se o `ddl-auto=validate` continua passando.

## Build e testes

Build do backend:

```bash
cd backend
mvn -DskipTests package
```

Testes:

```bash
cd backend
mvn test
```

## Documentação complementar

Use os documentos abaixo conforme o objetivo:

- [docs/README.md](docs/README.md): índice geral da documentação disponível em `docs/`.
- [docs/schema_normalized.sql](docs/schema_normalized.sql): schema relacional oficial do projeto, usado como base do baseline Flyway.
- [docs/semantic_search_migration.sql](docs/semantic_search_migration.sql): estrutura oficial da camada de busca semântica com `pgvector`.
- [docs/fluxo-negocio-atual.md](docs/fluxo-negocio-atual.md): visão de negócio ponta a ponta do que já existe hoje, incluindo autenticação e chamadas atuais da API.
- [docs/architecture/ai/00-visao-geral.md](docs/architecture/ai/00-visao-geral.md): visão técnica geral do backend, fontes de verdade e estado atual da aplicação.
- [docs/architecture/ai/01-schema-e-regras.md](docs/architecture/ai/01-schema-e-regras.md): regras de integridade e decisões de modelagem que devem guiar banco, domínio e API.
- [docs/architecture/ai/02-organizacao-backend-spring.md](docs/architecture/ai/02-organizacao-backend-spring.md): organização esperada do backend Spring Boot, convenções e estratégia de evolução.
- [docs/architecture/ai/03-skills-tecnicas-ia.md](docs/architecture/ai/03-skills-tecnicas-ia.md): checklist técnico para implementações assistidas por IA.
- [AGENTS.md](AGENTS.md): guia operacional para agentes de IA seguirem os padrões, a ordem de leitura e o fluxo do projeto.
