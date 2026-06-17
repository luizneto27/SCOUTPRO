package com.scoutpro.backend.infrastructure.web.campeonato;

import com.scoutpro.backend.domain.enums.TipoCampeonato;

public record CampeonatoResponse(
        Integer id,
        String nome,
        Integer paisId,
        TipoCampeonato tipoCampeonato,
        String temporada,
        Integer divisao,
        Integer ranking
) {
}
