# AGENTS

Guia para agentes de IA que forem atuar neste repositório.

## Objetivo do projeto

O ScoutPro é um backend Java com Spring Boot 4 e PostgreSQL. O foco atual do repositório é consolidar o schema relacional com Flyway, manter o mapeamento JPA aderente ao banco e evoluir a API com segurança JWT.

## Leitura obrigatória antes de codar

1. `README.md`
2. `docs/architecture/ai/00-visao-geral.md`
3. `docs/architecture/ai/01-schema-e-regras.md`
4. `docs/architecture/ai/02-organizacao-backend-spring.md`
5. `backend/src/main/resources/db/migration`

## Fonte de verdade

Ao implementar qualquer funcionalidade, use esta ordem de precedência:

1. migrations Flyway em `backend/src/main/resources/db/migration`
2. configuração real do backend em `backend/src/main/resources`
3. código Java já implementado
4. documentação em `docs/`

Se houver conflito entre documentação e código/migration, ajuste a documentação ou o código para ficar consistente com o schema versionado.

## Arquitetura atual

Estrutura principal:

- `config/security`: JWT, filtro, propriedades e bootstrap do admin.
- `application`: serviços de aplicação.
- `domain`: enums de domínio refletidos do banco.
- `infrastructure/persistence/entity`: entidades JPA alinhadas às tabelas.
- `infrastructure/persistence/repository`: repositórios Spring Data.
- `infrastructure/web`: controllers e DTOs HTTP.

Estado implementado neste momento:

- autenticação por `username` e senha;
- emissão e validação de JWT;
- endpoint `POST /api/v1/auth/login`;
- endpoint `GET /api/v1/auth/me`;
- endpoint `POST /api/v1/usuarios` protegido por role `ADMIN`;
- bootstrap automático de admin se ainda não existir um usuário admin.

## Regras obrigatórias de implementação

- Não editar migrations antigas já aplicadas.
- Toda mudança de schema exige nova migration Flyway.
- Manter `ddl-auto=validate`.
- Não expor entities JPA diretamente na API.
- DTOs devem ter Bean Validation.
- Regras de negócio ficam em serviço, não em controller.
- Escritas com impacto de consistência devem ser transacionais.
- Senhas nunca podem ser persistidas em texto puro.
- Novos endpoints públicos precisam ser liberados explicitamente na `SecurityConfig`.
- Para mudanças em autenticação/autorização, preservar compatibilidade com o fluxo JWT atual.

## Fluxo recomendado para novas features

1. Ler o schema e identificar tabelas, constraints, FKs, checks e unicidades afetadas.
2. Criar a migration correspondente, se houver mudança estrutural.
3. Ajustar ou criar entidades JPA aderentes ao banco.
4. Implementar repositórios e serviços com regras transacionais.
5. Criar DTOs e controller sem expor entidades.
6. Revisar impacto em segurança.
7. Validar startup com Flyway e `ddl-auto=validate`.
8. Atualizar `README.md` ou `docs/` se o fluxo do projeto mudar.

## Convenções de API

- Base atual: `/api/v1`
- Autenticação: `Authorization: Bearer <token>`
- `400` para payload inválido
- `401` para falha de autenticação
- `403` para falta de permissão
- `404` para recurso inexistente
- `409` para conflito de integridade ou unicidade

## Convenções de banco

- Usar enums Java para domínios fechados já definidos no schema.
- Respeitar unicidades e checks também na camada de serviço.
- Não duplicar regras derivadas que já pertencem ao banco.
- Quando uma coluna for gerada/calculada no banco, a aplicação deve consumir o valor persistido em vez de recalcular.

## Subida local para validar mudanças

Stack completa com Docker:

```bash
copy .env.example .env
docker compose up -d --build
```

Banco em Docker + aplicação local:

```bash
docker compose up -d postgres
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

## Checklist antes de encerrar uma alteração

- schema e entidades continuam consistentes;
- startup local aplica Flyway sem erro;
- endpoints afetados continuam coerentes com a segurança;
- documentação foi atualizada se a arquitetura ou o fluxo mudou.
