package com.scoutpro.backend.infrastructure.web.dashboard;

import java.math.BigDecimal;

public record DashboardAtletaDestaqueResponse(
        Integer jogadorId,
        String nome,
        String posicao,
        String clubeNome,
        int jogos,
        int gols,
        int assistencias,
        BigDecimal indicePerformance
) {
}
