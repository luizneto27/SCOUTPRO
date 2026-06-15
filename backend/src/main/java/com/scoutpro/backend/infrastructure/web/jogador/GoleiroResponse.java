package com.scoutpro.backend.infrastructure.web.jogador;

public record GoleiroResponse(
        Integer jogadorId,
        Integer golsSofridos,
        Integer reposicoes,
        Integer penaltisDefendidos,
        Integer defesasDificeis,
        Integer jogosSemSofrerGol
) {
}

