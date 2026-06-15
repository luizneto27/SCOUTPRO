# Proximos Passos de Implementacao do ScoutPro

Este documento organiza os proximos passos para transformar a base atual do ScoutPro em um sistema funcional de ponta a ponta.

Hoje o projeto ja possui:

- backend Spring Boot estruturado;
- banco PostgreSQL versionado com Flyway;
- schema normalizado consolidado;
- base de autenticacao com JWT;
- criacao de usuario administrador;
- cadastro de usuarios protegido por role `ADMIN`;
- suporte inicial para busca semantica no banco.

O objetivo agora e sair da base estrutural e evoluir para fluxos reais de negocio.

## Prioridade geral

Ordem recomendada de implementacao:

1. consolidar a base tecnica e os testes;
2. implementar cadastros mestres;
3. implementar modulo de jogadores;
4. implementar contratos e transferencias;
5. implementar relatorios e monitoramento;
6. implementar partidas, disputas e estatisticas;
7. implementar busca semantica e consultas avancadas;
8. preparar observabilidade, seguranca e deploy.

## Fase 1: consolidacao da base tecnica

Objetivo:

- garantir que o projeto esteja estavel para crescer sem retrabalho.

Passos:

- validar todas as entidades JPA contra o schema atual;
- revisar relacionamentos ainda nao usados em fluxo real;
- padronizar tratamento de erros HTTP;
- criar handler global para `400`, `404`, `409` e `500`;
- garantir que a documentacao OpenAPI reflita os endpoints existentes;
- criar testes de startup com banco limpo e migrations aplicadas;
- validar o bootstrap do admin e o fluxo de login.

Entregas esperadas:

- backend sobe sem ajustes manuais;
- migrations aplicam do zero sem erro;
- fluxo de autenticacao fica confiavel para os proximos modulos.

## Fase 2: cadastros mestres

Objetivo:

- implementar as entidades base que sustentam os demais fluxos.

Modulos recomendados:

- paises;
- posicoes;
- marcas;
- empresarios;
- clubes;
- clientes;
- scouts.

Passos:

- criar DTOs de entrada e saida;
- criar controllers REST para CRUD basico;
- aplicar validacoes de negocio e unicidade;
- proteger escrita com autenticacao;
- documentar endpoints no Swagger.

Entregas esperadas:

- dados de referencia passam a ser gerenciados pela API;
- os modulos dependentes deixam de exigir inserts manuais no banco.

## Fase 3: modulo de jogadores

Objetivo:

- tornar jogadores um agregado real do sistema.

Escopo minimo:

- cadastro de jogador;
- consulta por id;
- listagem paginada;
- atualizacao cadastral;
- vinculacao de pais;
- vinculacao de empresario;
- atribuicao de tipo de jogador;
- atribuicao de posicoes via `jogador_posicoes`.

Regras importantes:

- respeitar o dominio fechado de `tipo_jogador`;
- nao duplicar posicoes fora da tabela associativa;
- validar consistencia entre jogador e especializacao.

Entregas esperadas:

- jogadores passam a existir de forma gerenciavel;
- base pronta para contratos, relatorios e monitoramento.

## Fase 4: contratos e transferencias

Objetivo:

- controlar historico e estado contratual dos jogadores.

Escopo minimo:

- criar contrato;
- encerrar contrato;
- trocar contrato ativo;
- registrar transferencia;
- consultar historico de contratos;
- consultar historico de transferencias.

Regras criticas:

- um jogador nao pode ter mais de um contrato ativo;
- transferencia exige clube de origem diferente do de destino;
- operacoes devem ser transacionais.

Entregas esperadas:

- sistema passa a refletir o vinculo do jogador com clubes;
- base pronta para estatisticas por clube e competicao.

## Fase 5: relatorios e monitoramento

Objetivo:

- entregar o coracao do fluxo de scouting.

Escopo minimo:

- cliente monitora jogador;
- scout registra relatorio;
- consulta de relatorios por jogador;
- consulta de relatorios por scout;
- consulta de jogadores monitorados por cliente.

Regras importantes:

- `nota_geral` deve ser lida do banco;
- `recomendacao` deve seguir enum fechado;
- endpoints devem refletir o papel de scout, cliente e admin.

Entregas esperadas:

- o sistema deixa de ser apenas cadastro e passa a registrar inteligencia de scouting.

## Fase 6: partidas, disputas e estatisticas

Objetivo:

- capturar desempenho esportivo e consolidar indicadores.

Escopo minimo:

- cadastro de competicoes;
- cadastro de edicoes;
- cadastro de partidas;
- associacao de clubes participantes;
- registro de disputa por jogador;
- leitura das estatisticas agregadas.

Regras importantes:

- o trigger do banco ja consolida estatisticas a partir de `disputa`;
- a aplicacao deve respeitar o modelo relacional sem recalcular o que o banco ja faz;
- historico de contrato influencia a identificacao do clube do jogador na partida.

Entregas esperadas:

- base pronta para rankings, dashboards e filtros tecnicos.

## Fase 7: busca semantica e consultas inteligentes

Objetivo:

- evoluir a descoberta de jogadores com apoio de embeddings.

Escopo minimo:

- definir como `perfil_texto` sera montado;
- definir pipeline para gerar `perfil_vetor`;
- criar rotina de atualizacao dos embeddings;
- implementar consulta por similaridade;
- combinar filtros estruturados com busca semantica.

Dependencias:

- regras claras de quando recalcular embeddings;
- estrategia de integracao com IA ou servico externo;
- definicao de custo e frequencia de atualizacao.

Entregas esperadas:

- busca de jogadores por perfil tecnico e contextual, nao apenas por campos exatos.

## Fase 8: autorizacao por perfil

Objetivo:

- sair do modelo atual centrado em `ADMIN` e preparar o uso real do sistema.

Passos:

- definir perfis operacionais;
- separar permissoes por endpoint;
- revisar quem pode cadastrar, editar, consultar e aprovar;
- decidir se `USER` sera mantido ou substituido por perfis mais especificos.

Perfis provaveis:

- `ADMIN`;
- `SCOUT`;
- `CLIENTE`;
- `OPERADOR`.

Entregas esperadas:

- politica de acesso coerente com o negocio;
- menor risco de permissao excessiva.

## Fase 9: experiencia operacional

Objetivo:

- tornar o ambiente mais previsivel para dev, homologacao e producao.

Passos:

- adicionar healthcheck do backend no `docker-compose`;
- criar seeds opcionais para ambiente local;
- documentar reset completo de ambiente;
- revisar estrategia de logs;
- adicionar metricas e monitoramento basico;
- revisar pipeline de build e deploy.

Entregas esperadas:

- menor tempo de setup;
- menor risco de erro operacional;
- facilidade para diagnosticar falhas.

## Fase 10: qualidade e testes

Objetivo:

- impedir regressao conforme os modulos avancam.

Camadas de teste recomendadas:

- testes de service para regras de negocio;
- testes de repositorio com Postgres real;
- testes de integracao dos endpoints criticos;
- testes do fluxo de autenticacao;
- testes de migrations em banco limpo.

Casos criticos a cobrir:

- conflito de unicidade;
- contrato ativo duplicado;
- login com credenciais invalidas;
- criacao de usuario sem role adequada;
- insercao de `disputa` refletindo em `estatisticas`;
- falha de migration por schema divergente.

## Backlog funcional sugerido

Lista objetiva de entregas em ordem:

1. CRUD de paises.
2. CRUD de clubes.
3. CRUD de scouts.
4. CRUD de jogadores.
5. Endpoint para definir posicoes do jogador.
6. Endpoint para criar contrato.
7. Endpoint para transferir jogador.
8. Endpoint para criar relatorio.
9. Endpoint para monitorar jogador por cliente.
10. Endpoint para cadastrar partida.
11. Endpoint para registrar disputa.
12. Endpoint para consultar estatisticas agregadas.
13. Endpoint para busca de jogadores com filtros.
14. Endpoint para busca semantica por perfil.

## Sequencia recomendada para a equipe

Se a equipe quiser maximizar entrega com menor risco, a sequencia mais pragmatica e:

1. finalizar autenticacao e qualidade da base;
2. entregar cadastros mestres;
3. entregar jogadores;
4. entregar contratos e transferencias;
5. entregar relatorios;
6. entregar partidas e estatisticas;
7. entregar busca semantica;
8. endurecer autorizacao, observabilidade e deploy.

## Criterio de pronto por fase

Cada fase deve ser considerada pronta apenas quando:

- houver migration, se o schema mudou;
- backend subir em banco limpo;
- endpoints estiverem documentados;
- regras criticas estiverem testadas;
- documentacao tiver sido atualizada.

## Decisao recomendada imediata

O melhor proximo passo tecnico e funcional e:

1. fechar a fase de consolidacao tecnica;
2. implementar cadastros mestres;
3. iniciar o modulo de jogadores.

Essa ordem cria base suficiente para o sistema comecar a gerar valor real sem antecipar complexidade de relatorios, disputas e embeddings antes da hora.
