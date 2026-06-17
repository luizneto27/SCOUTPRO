package com.scoutpro.backend.infrastructure.web.partida;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record PartidaRequest(
        @NotNull LocalDate data,
        @NotNull Integer competicaoEdicaoId
) {
}
