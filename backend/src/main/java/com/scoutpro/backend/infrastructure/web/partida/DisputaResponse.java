package com.scoutpro.backend.infrastructure.web.partida;

import java.math.BigDecimal;

public record DisputaResponse(
        Integer jogadorId,
        String jogadorNome,
        Integer partidaId,
        Integer golsPartida,
        Integer finalizacoesGolPartida,
        Integer faltasCometidasPartida,
        Integer faltasSofridasPartida,
        Integer cartoesAmarelosPartida,
        Integer cartoesVermelhosPartida,
        Integer impedimentosPartida,
        BigDecimal kmPercorridosPartida,
        Integer desarmesPartida,
        Integer passesChavePartida,
        Integer minutosJogadosPartida,
        BigDecimal notaPartida,
        Integer reposicoesPartida,
        Integer golsSofridosPartida,
        Integer penaltisDefendidosPartida,
        Integer defesasDificeisPartida,
        Boolean cleanSheetPartida
) {
}
