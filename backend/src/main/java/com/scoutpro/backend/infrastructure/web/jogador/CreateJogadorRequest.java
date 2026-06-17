package com.scoutpro.backend.infrastructure.web.jogador;

import com.scoutpro.backend.domain.enums.TipoJogador;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CreateJogadorRequest(
        @NotBlank @Size(max = 100) String nome,
        @Size(max = 200) String nomeCompleto,
        @Size(max = 10000) String perfilTexto,
        @Past LocalDate dataNascimento,
        Integer paisId,
        @DecimalMin("0.00") @Digits(integer = 13, fraction = 2) BigDecimal valorMercado,
        @Min(0) Integer titulos,
        @Min(1) @Max(300) Short alturaCm,
        @Min(1) @Max(300) Short pesoKg,
        @Pattern(regexp = "^[DEA]$", message = "deve ser D, E ou A") String peDominante,
        Integer empresarioId,
        Boolean ativo,
        @NotNull TipoJogador tipoJogador,
        List<@Valid JogadorPosicaoRequest> posicoes
) {
}

