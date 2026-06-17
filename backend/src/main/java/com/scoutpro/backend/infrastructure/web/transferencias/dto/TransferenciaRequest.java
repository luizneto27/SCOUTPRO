package com.scoutpro.backend.infrastructure.web.transferencias.dto;

import com.scoutpro.backend.domain.enums.TipoTransferencia;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TransferenciaRequest {

    @NotNull
    private Integer idJogador;

    @NotNull
    private Integer clubeOrigemId;

    @NotNull
    private Integer clubeDestinoId;

    @NotNull
    @DecimalMin("0")
    private BigDecimal valor;

    @NotNull
    private TipoTransferencia tipo;

}
