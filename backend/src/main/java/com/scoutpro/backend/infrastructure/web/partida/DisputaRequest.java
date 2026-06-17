package com.scoutpro.backend.infrastructure.web.partida;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public record DisputaRequest(
        @NotNull @Positive Integer jogadorId,
        @PositiveOrZero Integer golsPartida,
        @PositiveOrZero Integer finalizacoesGolPartida,
        @PositiveOrZero Integer faltasCometidasPartida,
        @PositiveOrZero Integer faltasSofridasPartida,
        @PositiveOrZero Integer cartoesAmarelosPartida,
        @PositiveOrZero Integer cartoesVermelhosPartida,
        @PositiveOrZero Integer impedimentosPartida,
        @DecimalMin("0.00") @Digits(integer = 6, fraction = 2) BigDecimal kmPercorridosPartida,
        @PositiveOrZero Integer desarmesPartida,
        @PositiveOrZero Integer passesChavePartida,
        @PositiveOrZero Integer minutosJogadosPartida,
        @DecimalMin("0.0") @Digits(integer = 2, fraction = 1) @Min(0) @Max(10) BigDecimal notaPartida,
        @PositiveOrZero Integer reposicoesPartida,
        @PositiveOrZero Integer golsSofridosPartida,
        @PositiveOrZero Integer penaltisDefendidosPartida,
        @PositiveOrZero Integer defesasDificeisPartida,
        Boolean cleanSheetPartida
) {
}
