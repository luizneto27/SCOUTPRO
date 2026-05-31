# Schema e Regras de Banco (Fonte para IA)

## Principios de integridade
- Toda relacao entre entidades deve usar FK para PK numerica (evitar vinculos textuais).
- Campos com `CHECK` sao regras de negocio obrigatorias.
- Campos com `UNIQUE` e indices unicos parciais devem ser garantidos tambem na camada de servico.
- Campos gerados pelo banco (ex.: `relatorios.nota_geral`) nao devem ser recalculados ou persistidos pela aplicacao.
- Senhas nunca devem ser armazenadas em texto puro; usar hash forte (BCrypt).

## Entidades centrais
- Base/dominio: `paises`, `posicoes`, `marcas`, `empresarios`.
- Organizacao: `clubes`, `clientes`, `scouts`, `scout_autonomo_detalhes`.
- Autenticacao: `usuarios`.
- Competicao: `competicoes`, `competicoes_edicoes`, `clube_participacoes`.
- Jogador: `jogadores`, `jogador_posicoes`, `goleiros`, `jogadores_linha`.
- Historico: `contratos`, `transferencias`, `realiza`, `jogador_patrocinios`, `lesoes`.
- Observacao: `monitora`, `relatorios`.
- Jogo/desempenho: `partidas`, `partida_clubes`, `disputa`, `estatisticas`.

## Regras criticas que impactam API
1. Um jogador so pode ter um contrato ativo:
- `uq_contrato_ativo_jogador` em `contratos(id_jogador) WHERE ativo = TRUE`.
- Ao ativar novo contrato, desativar contrato anterior na mesma transacao.

2. Transferencia exige clubes distintos:
- `CHECK (clube_origem_id <> clube_destino_id)`.

3. Posicoes do jogador sao multivaloradas:
- Usar `jogador_posicoes` com `ordem` unica por jogador.
- Nao duplicar posicao primaria/secundaria em `jogadores`.

4. Regras de recomendacao e tipo sao domínios fechados:
- `relatorios.recomendacao`: `CONTRATAR`, `MONITORAR`, `DESCARTAR`.
- `transferencias.tipo`: `COMPRA`, `EMPRESTIMO`, `TROCA`, `FIM_EMPRESTIMO`, `LIVRE`.
- `competicoes.tipo_campeonato`: `LIGA`, `COPA`, `AMISTOSO`, `TORNEIO`.
- Validar no dominio Java com enum.

5. Nota geral de relatorio:
- Gerada no banco por coluna `GENERATED ALWAYS`.
- API recebe notas parciais e retorna `nota_geral` lida do banco.

6. Partidas usam modelagem normalizada de placar:
- Placar vem de `partida_clubes.gols` por `mando`.
- Nao usar string unica de placar.

7. Consistencia temporal:
- `data_fim >= data_inicio` em contratos e patrocinio.
- Temporada por edicao em `competicoes_edicoes`, nao em `competicoes`.

8. Autenticacao e identidade:
- `usuarios.username`, `usuarios.cpf` e `usuarios.email` sao unicos.
- Login deve ser feito por `username + senha`.
- JWT deve ser validado em endpoints protegidos.

## Padrao minimo de validacoes no backend
- Bean Validation em DTOs para ranges e obrigatoriedade.
- Validacoes de negocio no servico para regras que dependem de consulta (ex.: contrato ativo unico).
- Tratamento uniforme de erro de integridade (ex.: `409 Conflict` para unicidade).
- Para cadastro de usuario, validar formato de `cpf`, `email` e tamanho minimo de senha.

## Consultas analiticas de referencia
As consultas analiticas de referencia devem ser mantidas em `docs/domain` e guiar endpoints de busca avancada (ex.: eficiencia por 90, top recomendados, contratos a vencer, ranking de clubes).
