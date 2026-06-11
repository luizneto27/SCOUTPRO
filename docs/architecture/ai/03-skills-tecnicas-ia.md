# Skills Tecnicas Necessarias (IA de Implementacao)

## 1. Modelagem JPA orientada ao schema
- Mapear corretamente PK, FK, `UNIQUE`, `CHECK` e indices.
- Tratar relacoes 1:1 (`scout_autonomo_detalhes`, `goleiros`, `jogadores_linha`) e N:N com tabela associativa.
- Evitar mapeamentos que escondam regras importantes do banco.

## 2. Regras de negocio transacionais
- Implementar fluxos criticos com transacao atomica:
  - ativacao/substituicao de contrato ativo;
  - registro de transferencia e vinculos;
  - criacao de relatorio com validacoes de dominio.
- Garantir idempotencia quando aplicavel.

## 3. Design de API REST
- DTOs de entrada/saida com validacao forte.
- Erros padronizados (400, 404, 409, 422).
- Endpoints de consulta simples e analitica separados por responsabilidade.

## 4. SQL e performance
- Aproveitar indices existentes nas queries mais frequentes.
- Evitar N+1 com estrategia de fetch adequada.
- Usar projections/queries especificas para consultas analiticas.

## 5. Qualidade de codigo
- Codigo orientado a casos de uso, nao apenas CRUD.
- Cobertura de testes para regras que refletem constraints do banco.
- Tratamento de excecoes centralizado e observabilidade basica (logs estruturados).

## 6. Seguranca e evolucao
- Seguranca JWT ja implementada; evolucoes devem manter compatibilidade com esse fluxo.
- Autenticacao atual usa tabela `usuarios` (username/senha_hash + ativo).
- Endpoint de cadastro (`POST /api/v1/usuarios`) e login (`POST /api/v1/auth/login`) sao parte obrigatoria do bootstrap.
- Preparar evolucao para autorizacao por perfil (scout, cliente, admin) sem quebrar o modelo atual.
- Planejar versionamento de API e de schema (Flyway) desde o inicio.

## Checklist de pronto para iniciar
- Entender o dominio principal: jogadores, scouts, clubes, relatorios, transferencias.
- Conferir regras de integridade no schema antes de codar cada modulo.
- Verificar se novos endpoints estao documentados no Swagger/OpenAPI.
- Garantir que alteracoes de schema entram via nova migration Flyway (nunca editando V1/V2).
- Implementar primeiro os agregados com maior impacto de regra:
  1. `jogadores` + `jogador_posicoes`
  2. `contratos`
  3. `transferencias`
  4. `relatorios`
  5. `partidas` + `disputa`
