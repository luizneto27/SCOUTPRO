package com.scoutpro.backend.infrastructure.web.dashboard;

import java.time.LocalDate;

public record DashboardAlertaResponse(
        String tipo,
        String atleta,
        String descricao,
        LocalDate data,
        String severidade
) {
}
