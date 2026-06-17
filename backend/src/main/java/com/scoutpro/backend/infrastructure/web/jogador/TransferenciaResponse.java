package com.scoutpro.backend.infrastructure.web.jogador;

import com.scoutpro.backend.domain.enums.TipoTransferencia;
import java.math.BigDecimal;
import java.time.LocalDate;

public record TransferenciaResponse(
        Integer id,
        Integer jogadorId,
        String jogadorNome,
        LocalDate dataTransferencia,
        BigDecimal valorPago,
        TipoTransferencia tipo,
        Integer clubeOrigemId,
        String clubeOrigemNome,
        String cnpjClubeOrigem,
        Integer clubeDestinoId,
        String clubeDestinoNome,
        String cnpjClubeDestino
) {
}
