package com.scoutpro.backend.infrastructure.web.partida;

public record EstatisticaResponse(
        Integer id,
        Integer jogadorId,
        String jogadorNome,
        Integer clubeId,
        String clubeNome,
        Integer competicaoEdicaoId,
        Integer campeonatoId,
        String campeonatoNome,
        String temporada,
        Short jogos,
        Integer minutos,
        Short titularidades,
        Short gols,
        Short assistencias,
        Short chutes,
        Short chutesGol,
        Short interceptacoes,
        Short desarmes,
        Short amarelos,
        Short vermelhos
) {
}
