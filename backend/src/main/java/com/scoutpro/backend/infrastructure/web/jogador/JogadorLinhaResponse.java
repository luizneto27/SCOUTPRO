package com.scoutpro.backend.infrastructure.web.jogador;

import java.math.BigDecimal;

public record JogadorLinhaResponse(
        Integer jogadorId,
        Integer gols,
        Integer desarmes,
        Integer cartoesAmarelos,
        Integer cartoesVermelhos,
        Integer passesChave,
        BigDecimal kmPercorridos,
        BigDecimal notaMedia,
        Integer minutosJogados,
        Integer faltasSofridas,
        Integer faltasCometidas,
        Integer impedimentos,
        Integer finalizacoesGol
) {
}

