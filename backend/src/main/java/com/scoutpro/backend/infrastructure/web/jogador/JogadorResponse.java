package com.scoutpro.backend.infrastructure.web.jogador;

import com.scoutpro.backend.domain.enums.TipoJogador;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record JogadorResponse(
        Integer id,
        String nome,
        String nomeCompleto,
        String perfilTexto,
        LocalDate dataNascimento,
        PaisResumoResponse pais,
        BigDecimal valorMercado,
        Integer titulos,
        Short alturaCm,
        Short pesoKg,
        String peDominante,
        EmpresarioResumoResponse empresario,
        Boolean ativo,
        TipoJogador tipoJogador,
        List<JogadorPosicaoResponse> posicoes,
        JogadorLinhaResponse jogadorLinha,
        GoleiroResponse goleiro
) {
}

