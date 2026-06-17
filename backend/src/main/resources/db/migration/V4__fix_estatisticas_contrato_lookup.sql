CREATE OR REPLACE FUNCTION fn_apply_delta_estatisticas_from_disputa(
  p_id_jogador INT,
  p_id_partida INT,
  p_gols_partida INT,
  p_finalizacoes_gol_partida INT,
  p_desarmes_partida INT,
  p_cartoes_amarelos_partida INT,
  p_cartoes_vermelhos_partida INT,
  p_minutos_jogados_partida INT,
  p_sign INT
)
RETURNS VOID AS $$
DECLARE
  v_clube_id INT;
  v_competicao_edicao_id INT;
BEGIN
  SELECT p.competicao_edicao_id
    INTO v_competicao_edicao_id
  FROM partidas p
  WHERE p.id = p_id_partida;

  SELECT c.clube_id
    INTO v_clube_id
  FROM contratos c
  JOIN partidas p ON p.id = p_id_partida
  WHERE c.id_jogador = p_id_jogador
    AND c.data_inicio <= p.data
    AND (c.data_fim IS NULL OR c.data_fim >= p.data)
  ORDER BY c.data_inicio DESC
  LIMIT 1;

  IF v_clube_id IS NULL THEN
    RAISE EXCEPTION 'Nao foi encontrado contrato ativo/valido para o jogador % na partida %', p_id_jogador, p_id_partida;
  END IF;

  IF p_sign = 1 THEN
    INSERT INTO estatisticas (
      jogador_id, clube_id, competicao_edicao_id, jogos, minutos, titularidades, gols,
      assistencias, chutes, chutes_gol, interceptacoes, desarmes, amarelos, vermelhos
    ) VALUES (
      p_id_jogador,
      v_clube_id,
      v_competicao_edicao_id,
      1,
      COALESCE(p_minutos_jogados_partida, 0),
      CASE WHEN COALESCE(p_minutos_jogados_partida, 0) >= 60 THEN 1 ELSE 0 END,
      COALESCE(p_gols_partida, 0),
      0,
      COALESCE(p_finalizacoes_gol_partida, 0),
      COALESCE(p_finalizacoes_gol_partida, 0),
      0,
      COALESCE(p_desarmes_partida, 0),
      COALESCE(p_cartoes_amarelos_partida, 0),
      COALESCE(p_cartoes_vermelhos_partida, 0)
    )
    ON CONFLICT (jogador_id, clube_id, competicao_edicao_id)
    DO UPDATE SET
      jogos = estatisticas.jogos + COALESCE(EXCLUDED.jogos, 0),
      minutos = estatisticas.minutos + COALESCE(EXCLUDED.minutos, 0),
      titularidades = estatisticas.titularidades + COALESCE(EXCLUDED.titularidades, 0),
      gols = estatisticas.gols + COALESCE(EXCLUDED.gols, 0),
      assistencias = estatisticas.assistencias + COALESCE(EXCLUDED.assistencias, 0),
      chutes = estatisticas.chutes + COALESCE(EXCLUDED.chutes, 0),
      chutes_gol = estatisticas.chutes_gol + COALESCE(EXCLUDED.chutes_gol, 0),
      interceptacoes = estatisticas.interceptacoes + COALESCE(EXCLUDED.interceptacoes, 0),
      desarmes = estatisticas.desarmes + COALESCE(EXCLUDED.desarmes, 0),
      amarelos = estatisticas.amarelos + COALESCE(EXCLUDED.amarelos, 0),
      vermelhos = estatisticas.vermelhos + COALESCE(EXCLUDED.vermelhos, 0);
  ELSE
    UPDATE estatisticas
    SET
      jogos = jogos - 1,
      minutos = minutos - COALESCE(p_minutos_jogados_partida, 0),
      titularidades = titularidades - CASE WHEN COALESCE(p_minutos_jogados_partida, 0) >= 60 THEN 1 ELSE 0 END,
      gols = gols - COALESCE(p_gols_partida, 0),
      assistencias = assistencias - 0,
      chutes = chutes - COALESCE(p_finalizacoes_gol_partida, 0),
      chutes_gol = chutes_gol - COALESCE(p_finalizacoes_gol_partida, 0),
      interceptacoes = interceptacoes - 0,
      desarmes = desarmes - COALESCE(p_desarmes_partida, 0),
      amarelos = amarelos - COALESCE(p_cartoes_amarelos_partida, 0),
      vermelhos = vermelhos - COALESCE(p_cartoes_vermelhos_partida, 0)
    WHERE jogador_id = p_id_jogador
      AND clube_id = v_clube_id
      AND (
        (competicao_edicao_id = v_competicao_edicao_id)
        OR (competicao_edicao_id IS NULL AND v_competicao_edicao_id IS NULL)
      );
  END IF;

  DELETE FROM estatisticas e
  WHERE e.jogador_id = p_id_jogador
    AND e.clube_id = v_clube_id
    AND (
      (e.competicao_edicao_id = v_competicao_edicao_id)
      OR (e.competicao_edicao_id IS NULL AND v_competicao_edicao_id IS NULL)
    )
    AND e.jogos <= 0
    AND e.minutos <= 0
    AND e.titularidades <= 0
    AND e.gols <= 0
    AND e.assistencias <= 0
    AND e.chutes <= 0
    AND e.chutes_gol <= 0
    AND e.interceptacoes <= 0
    AND e.desarmes <= 0
    AND e.amarelos <= 0
    AND e.vermelhos <= 0;
END;
$$ LANGUAGE plpgsql;
