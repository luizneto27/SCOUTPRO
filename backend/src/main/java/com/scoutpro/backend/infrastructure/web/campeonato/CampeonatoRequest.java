package com.scoutpro.backend.infrastructure.web.campeonato;

import com.scoutpro.backend.domain.enums.TipoCampeonato;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CampeonatoRequest(
        @NotBlank String nome,
        @NotNull Integer paisId,
        @NotNull TipoCampeonato tipoCampeonato,
        @NotBlank String temporada,
        Integer divisao,
        Integer ranking
) {
}
