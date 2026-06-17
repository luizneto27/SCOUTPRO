package com.scoutpro.backend.infrastructure.web.jogador;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;

public record JogadorLinhaRequest(
        @Min(0) Integer gols,
        @Min(0) Integer desarmes,
        @Min(0) Integer cartoesAmarelos,
        @Min(0) Integer cartoesVermelhos,
        @Min(0) Integer passesChave,
        @DecimalMin("0.00") @Digits(integer = 6, fraction = 2) BigDecimal kmPercorridos,
        @DecimalMin("0.0") @DecimalMax("10.0") @Digits(integer = 2, fraction = 1) BigDecimal notaMedia,
        @Min(0) Integer minutosJogados,
        @Min(0) Integer faltasSofridas,
        @Min(0) Integer faltasCometidas,
        @Min(0) Integer impedimentos,
        @Min(0) Integer finalizacoesGol
) {
}

