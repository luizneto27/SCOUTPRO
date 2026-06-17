package com.scoutpro.backend.infrastructure.web.jogador;

import com.scoutpro.backend.domain.enums.GravidadeLesao;
import com.scoutpro.backend.domain.enums.StatusRecuperacaoLesao;
import java.time.LocalDate;

public record LesaoResponse(
        Integer id,
        Integer jogadorId,
        String jogadorNome,
        LocalDate dataLesao,
        String tipoLesao,
        GravidadeLesao gravidade,
        StatusRecuperacaoLesao statusRecuperacao,
        Integer tempoRecuperacao,
        LocalDate dataPrevistaRetorno
) {
}
