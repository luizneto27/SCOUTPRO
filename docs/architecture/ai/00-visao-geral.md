# ScoutPro Backend AI Context

## Objetivo
Este conjunto de arquivos orienta a IA na construcao do backend do ScoutPro usando Java 21 e Spring Boot 4, com foco em aderencia ao schema SQL, seguranca JWT e regras de negocio do banco.

## Escopo do backend
- Expor APIs para cadastro, consulta e analise de jogadores, clubes, scouts, relatorios, transferencias e estatisticas.
- Respeitar constraints, FKs, unicidades e checks definidos no baseline Flyway (`backend/src/main/resources/db/migration/V1__baseline.sql`).
- Priorizar consistencia transacional para operacoes criticas (contratos, transferencias, monitoramento e relatorios).
- Prover autenticacao stateless com JWT e usuarios persistidos em banco.

## Fontes oficiais de verdade
- Schema base: `backend/src/main/resources/db/migration/V1__baseline.sql`
- Migracoes ativas: `backend/src/main/resources/db/migration`
- Dados de exemplo: criar migrations de seed quando necessario (ambiente local/dev)
- Consultas analiticas e padroes de uso: documentar em `docs/domain` quando surgirem
- Regras e motivacoes de modelagem: `docs/domain/scoutpro-relatorio.md` e docs em `docs/architecture/ai`
- Visao geral do projeto: `README.md`
- Configuracao de deploy local: `docker-compose.yml`

## Diretriz principal para a IA
Qualquer decisao de modelagem da API ou do dominio Java deve partir primeiro do banco normalizado. Se houver conflito entre implementacao e schema, ajustar a implementacao para manter a integridade do modelo relacional.

## Estado atual (obrigatorio considerar)
- Backend Java em `backend/`.
- Flyway habilitado, com `V1__baseline.sql` e `V2__create_usuarios.sql`.
- Seguranca JWT ativa com:
  - `POST /api/v1/usuarios` (cadastro)
  - `POST /api/v1/auth/login` (gera token)
  - `GET /api/v1/auth/me` (requer token)
- Swagger/OpenAPI ativo em `/swagger-ui/index.html` e `/v3/api-docs`.
