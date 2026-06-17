package com.scoutpro.backend.infrastructure.web.clube;

import com.scoutpro.backend.infrastructure.web.jogador.PaisResumoResponse;
import java.time.LocalDate;

public record ClubeResponse(
        Integer id,
        String cnpj,
        String nome,
        PaisResumoResponse pais,
        String cidade,
        LocalDate fundacao
) {
}
