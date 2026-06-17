package com.scoutpro.backend.infrastructure.web.jogador;

import jakarta.validation.constraints.Min;

public record GoleiroRequest(
        @Min(0) Integer golsSofridos,
        @Min(0) Integer reposicoes,
        @Min(0) Integer penaltisDefendidos,
        @Min(0) Integer defesasDificeis,
        @Min(0) Integer jogosSemSofrerGol
) {
}

