# Organizacao do Backend (Java 21 + Spring Boot 4)

## Stack alvo
- Java 21
- Spring Boot 4.x
- Spring Web
- Spring Data JPA
- Bean Validation
- Lombok (padrao para boilerplate de entidades/DTOs)
- Spring Security
- JWT
- Springdoc OpenAPI (Swagger)
- PostgreSQL driver
- Flyway para versionamento de schema/migracoes
- Testcontainers para testes de integracao com Postgres

## Estrutura sugerida de pacotes
```text
com.scoutpro.backend
  ├─ config
  │   └─ security
  ├─ application
  ├─ domain
  │   ├─ jogador
  │   ├─ clube
  │   ├─ scout
  │   ├─ relatorio
  │   ├─ transferencia
  │   ├─ contrato
  │   ├─ partida
  │   └─ estatistica
  └─ infrastructure
      ├─ persistence
      └─ web
```

## Padrao por modulo de dominio
- `Entity`: mapeia 1:1 com tabela (nomes e constraints refletidos).
- `Repository`: consultas basicas + queries especificas.
- `Service`: regras de negocio e transacoes.
- `Controller`: contratos HTTP e DTOs.
- `Mapper`: conversao Entity <-> DTO.

## Convencoes obrigatorias
- Nao expor entities JPA diretamente na API.
- Evitar logica de negocio em controller.
- Operacoes de escrita com `@Transactional`.
- Definir `@Version` para lock otimista quando houver risco de concorrencia.
- Usar naming consistente com banco para facilitar manutencao.
- Usar Lombok como padrao para getters/setters/construtores onde fizer sentido.
- Endpoint protegido deve exigir `Authorization: Bearer <token>`.
- Senhas devem entrar por DTO e serem persistidas apenas como hash BCrypt.
- Endpoints publicos devem ser explicitamente permitidos na `SecurityConfig` (ex.: `POST /api/v1/auth/login`).
- Cadastro de usuario (`POST /api/v1/usuarios`) deve exigir role `ADMIN`.

## Estratégia de migracao
- Tratar `docs/schema_normalized.sql` como fonte oficial do baseline.
- Tratar `docs/semantic_search_migration.sql` como fonte oficial da camada de busca semantica.
- Gerar migracoes incrementais via Flyway a partir desses SQLs.
- Nunca alterar migracao ja aplicada em ambiente compartilhado.
- Estado atual:
  - `V1__baseline.sql`: schema normalizado consolidado com autenticacao.
  - `V2__semantic_search.sql`: extensao `vector` e colunas de busca semantica.

## Regra de Evolucao de Schema (Obrigatoria)
- O schema deve evoluir exclusivamente via Flyway (`classpath:db/migration`).
- Qualquer mudanca em entidades JPA deve vir acompanhada da migration correspondente.
- Nao usar `ddl-auto=create`, `ddl-auto=update` ou alteracoes manuais como estrategia de evolucao.
- Manter `ddl-auto=validate` para detectar divergencia entre mapeamento e banco no startup.
- Se `validate` falhar, corrigir com migration nova (`Vx__...sql`), sem editar migrations ja aplicadas.

## Qualidade e testes
- Unitarios de service para regras de negocio.
- Integracao de repositorio com Postgres real (Testcontainers).
- Testes de contrato HTTP para endpoints criticos.
- Validar cenarios de erro de integridade (unicidade, FK, checks).
- Cobrir fluxo de autenticacao: criar usuario, login, acesso com token valido e rejeicao com token invalido.
