package com.scoutpro.backend.infrastructure.web.comparativo;

import java.math.BigDecimal;

public record ComparativoAtletaResponse(
        Integer id,
        String nome,
        String posicao,
        Integer idade,
        BigDecimal valorMercado,
        String clubeNome,
        int jogos,
        int minutos,
        int gols,
        int assistencias,
        int chutesGol,
        int desarmes,
        int amarelos,
        int vermelhos,
        BigDecimal tecnicaMedia,
        BigDecimal taticaMedia,
        BigDecimal fisicoMedio,
        BigDecimal mentalidadeMedia,
        BigDecimal potencialMedio,
        BigDecimal notaGeralMedia
) {
}
