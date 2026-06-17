package com.scoutpro.backend.infrastructure.web.transferencias.dto;

import com.scoutpro.backend.domain.enums.TipoTransferencia;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TransferenciaResponse {

    private Integer id;
    private LocalDate dataTransferencia;
    private BigDecimal valorPago;
    private TipoTransferencia tipo;
    private Integer jogadorId;
    private Integer clubeOrigemId;
    private Integer clubeDestinoId;

}
