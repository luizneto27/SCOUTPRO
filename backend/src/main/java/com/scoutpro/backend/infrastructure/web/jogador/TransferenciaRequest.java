package com.scoutpro.backend.infrastructure.web.jogador;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.scoutpro.backend.domain.enums.TipoTransferencia;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public record TransferenciaRequest(
        @NotNull @PastOrPresent @JsonProperty("data_transferencia") LocalDate dataTransferencia,
        @DecimalMin("0.00") @Digits(integer = 13, fraction = 2) @JsonProperty("valor_pago") BigDecimal valorPago,
        @NotNull TipoTransferencia tipo,
        @NotBlank
        @Pattern(
                regexp = "^(\\d{14}|\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2})$",
                message = "cnpj must be 14 digits or formatted as XX.XXX.XXX/XXXX-XX"
        )
        @JsonProperty("cnpj_clube_origem") String cnpjClubeOrigem,
        @NotBlank
        @Pattern(
                regexp = "^(\\d{14}|\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2})$",
                message = "cnpj must be 14 digits or formatted as XX.XXX.XXX/XXXX-XX"
        )
        @JsonProperty("cnpj_clube_destino") String cnpjClubeDestino,
        @DecimalMin("0.00") @Digits(integer = 13, fraction = 2) @JsonProperty("valor_contrato_destino") BigDecimal valorContratoDestino,
        @Positive @JsonProperty("tempo_contrato_destino") Integer tempoContratoDestino,
        @DecimalMin("0.00") @Digits(integer = 13, fraction = 2) @JsonProperty("multa_rescisoria_destino") BigDecimal multaRescisoriaDestino
) {
}
