package com.scoutpro.backend.infrastructure.web.clube;

import com.scoutpro.backend.domain.enums.TipoJogador;
import com.scoutpro.backend.infrastructure.web.jogador.PaisResumoResponse;

public record ClubeJogadorResponse(
        Integer id,
        String nome,
        String nomeCompleto,
        PaisResumoResponse pais,
        Boolean ativo,
        TipoJogador tipoJogador
) {
}
