package com.scoutpro.backend.infrastructure.web.jogador;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record JogadorPosicaoRequest(
        @NotNull Integer posicaoId,
        @NotNull @Min(1) Short ordem
) {
}

