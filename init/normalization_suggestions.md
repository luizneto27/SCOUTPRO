# Proposta de Normalizacao do Schema

## Criterios usados
- 1FN: atributos atomicos, sem listas/valores compostos em uma coluna.
- 2FN: em chaves compostas, nenhum atributo nao-chave pode depender de apenas parte da chave.
- 3FN: remover dependencias transitivas entre atributos nao-chave.
- BCNF: todo determinante deve ser superchave.
- 4FN/5FN: evitar combinacoes multivaloradas indevidas e decompor relacoes n-arias quando necessario.

## Principais problemas encontrados no schema atual
- Redundancia de posicao em `jogadores`: `posicao_id`, `posicao_sec_id` e ainda `jogadores_linha.posicao_primaria_id/posicao_secundaria_id`.
- Coluna derivada/ambigua em `partidas`: `placar` como texto mistura dois fatos (gols mandante/visitante).
- Dependencia de chave alternativa em `transferencias`: referencia clube por `cnpj` textual em vez da PK (`clubes.id`), aumentando acoplamento e risco de inconsistencias.
- Mistura de entidade principal e historico em `jogadores` (`clube_atual_id`) + `contratos` (historico contratual), gerando duplicidade sem fonte unica de verdade.
- Modelagem parcialmente duplicada para scouts (`scouts` e `scouts_autonomos`) com semantica sobreposta.
- Tabela `patrocinios` com atributo textual de marca repetido (anomalia de atualizacao para nome de marca).
- `competicoes.temporada` no cadastro da competicao (entidade estatica) em vez de temporada/edicao (entidade temporal).
- Inconsistencia tecnica: indice `idx_contratos_clube` referencia coluna inexistente `cnpj_clube`.

## Sugestoes de normalizacao

### 1) Separar competicao (base) de edicao/temporada
- Criar `competicoes` (nome, pais, tipo) e `competicoes_edicoes` (competicao_id, temporada, divisao, ranking).
- Justificativa (3FN): `temporada/divisao/ranking` nao sao propriedades permanentes da competicao, mas da edicao anual.

### 2) Separar clube (cadastro) de participacao por temporada
- Manter `clubes` como entidade estatica.
- Criar `clube_participacoes` para dados por temporada/competicao, caso necessario.
- Justificativa (3FN/BCNF): elimina atributos contextuais no cadastro base.

### 3) Tornar posicao de jogador multivalorada controlada
- Remover posicoes diretas de `jogadores` e de `jogadores_linha`.
- Criar `jogador_posicoes` (`jogador_id`, `posicao_id`, `ordem`).
- Justificativa (1FN/4FN): evita repeticao de colunas "primaria/secundaria" e suporta N posicoes sem alterar schema.

### 4) Definir clube atual a partir de contratos
- Remover `jogadores.clube_atual_id`.
- Fonte oficial do vinculo atual: `contratos` com restricao de unicidade parcial para 1 contrato ativo por jogador.
- Justificativa (3FN): remove redundancia e evita anomalia de atualizacao.

### 5) Normalizar patrocinio
- Criar `marcas` e `jogador_patrocinios` (N:N temporal).
- Justificativa (3FN): nome de marca deixa de ser repetido em cada linha de patrocinio.

### 6) Modelar partida com clubes participantes
- Em `partidas`, substituir `placar` textual por relacionamento de clubes participantes e gols por clube.
- Criar `partida_clubes` (`partida_id`, `clube_id`, `mando`, `gols`).
- Justificativa (1FN): placar deixa de ser campo composto; estrutura facilita consultas analiticas.

### 7) Transferencias por FK numerica
- Em `transferencias`, trocar `clube_origem`/`clube_destino` textuais para `clube_origem_id`/`clube_destino_id`.
- Justificativa (BCNF): determinantes baseados em PK reduzem dependencia de chaves de negocio mutaveis.

### 8) Unificar modelagem de scouts
- Usar `scouts` como entidade base e separar tipo/perfil em tabela de especializacao (`scout_autonomo_detalhes`).
- Justificativa (3FN): evita duplicidade semantica entre duas tabelas de pessoas com papeis parecidos.

### 9) Ajustar tabelas de fatos com chave composta
- Em `disputa` e `monitora`, manter PK composta e garantir que todos atributos dependam da chave completa.
- Justificativa (2FN): dados de evento dependem do par (jogador, partida) ou (cliente, jogador).

### 10) Padronizar dominios e checks
- Padronizar enums de status/tipos/recomendacoes via `CHECK` ou tabelas de dominio.
- Justificativa (BCNF): reduz variacao textual e inconsistencias.

## Beneficios esperados
- Menos redundancia e menor risco de inconsistencias.
- Melhor manutencao evolutiva (novas posicoes, novos papeis de scout, novas temporadas).
- Consultas analiticas mais simples e corretas (placar, historico contratual, edicoes de competicao).
- Melhor integridade referencial (FK sempre para PK principal).
