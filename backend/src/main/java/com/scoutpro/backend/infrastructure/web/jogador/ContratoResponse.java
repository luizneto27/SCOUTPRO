package com.scoutpro.backend.infrastructure.web.jogador;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ContratoResponse(
        Integer id,
        Integer jogadorId,
        String cnpjClube,
        BigDecimal valorContrato,
        Integer tempoContrato,
        BigDecimal multaRescisoria,
        LocalDate dataInicio,
        LocalDate dataFim,
        Boolean ativo
) {
}
