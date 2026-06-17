package com.scoutpro.backend.infrastructure.web.dashboard;

import java.util.List;

public record DashboardResumoResponse(
        long atletasAtivos,
        long clubes,
        long campeonatos,
        long lesoesEmRecuperacao,
        List<DashboardSerieItemResponse> performanceMedia,
        List<DashboardDistribuicaoItemResponse> statusSaude,
        List<DashboardAtletaDestaqueResponse> atletasDestaque,
        List<DashboardAlertaResponse> alertasRecentes
) {
}
