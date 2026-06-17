package com.scoutpro.backend.infrastructure.web.partida;

import java.time.LocalDate;

public record PartidaResponse(
        Integer id,
        LocalDate data,
        Integer competicaoEdicaoId
) {
}
