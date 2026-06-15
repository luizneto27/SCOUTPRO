package com.scoutpro.backend.infrastructure.web.jogador;

public record JogadorPosicaoResponse(
        Integer posicaoId,
        String nome,
        String sigla,
        Short ordem
) {
}

