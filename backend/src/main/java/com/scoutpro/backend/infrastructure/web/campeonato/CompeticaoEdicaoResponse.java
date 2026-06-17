package com.scoutpro.backend.infrastructure.web.campeonato;

import com.scoutpro.backend.domain.enums.TipoCampeonato;

public record CompeticaoEdicaoResponse(
        Integer id,
        Integer campeonatoId,
        String campeonatoNome,
        Integer paisId,
        TipoCampeonato tipoCampeonato,
        String temporada,
        Integer divisao,
        Integer ranking
) {
}
