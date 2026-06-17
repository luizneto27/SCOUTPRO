package com.scoutpro.backend.infrastructure.web.jogador;

import com.scoutpro.backend.domain.enums.GravidadeLesao;
import com.scoutpro.backend.domain.enums.StatusRecuperacaoLesao;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record LesaoRequest(
        @NotNull @Positive Integer jogadorId,
        @NotNull @PastOrPresent LocalDate dataLesao,
        @NotBlank @Size(max = 100) String tipoLesao,
        GravidadeLesao gravidade,
        StatusRecuperacaoLesao statusRecuperacao,
        @PositiveOrZero Integer tempoRecuperacao
) {
}
