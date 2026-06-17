package com.scoutpro.backend.infrastructure.web.jogador;

public record LesaoResumoResponse(
        long totalRegistros,
        long noDepartamentoMedico,
        long retornoPrevistoProximos7Dias,
        long recuperadas,
        long recuperadasNoMes
) {
}
