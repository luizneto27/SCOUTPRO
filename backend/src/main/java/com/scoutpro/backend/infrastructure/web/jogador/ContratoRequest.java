package com.scoutpro.backend.infrastructure.web.jogador;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ContratoRequest(
        @NotBlank
        @Pattern(
                regexp = "^(\\d{14}|\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2})$",
                message = "cnpj must be 14 digits or formatted as XX.XXX.XXX/XXXX-XX"
        )
        @JsonProperty("cnpj_clube") String cnpjClube,
        @DecimalMin("0.00") @Digits(integer = 13, fraction = 2) @JsonProperty("valor_contrato") BigDecimal valorContrato,
        @Positive @JsonProperty("tempo_contrato") Integer tempoContrato,
        @DecimalMin("0.00") @Digits(integer = 13, fraction = 2) @JsonProperty("multa_rescisoria") BigDecimal multaRescisoria,
        @NotNull @PastOrPresent @JsonProperty("data_inicio") LocalDate dataInicio
) {
}
