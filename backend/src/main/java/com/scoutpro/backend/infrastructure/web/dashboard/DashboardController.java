package com.scoutpro.backend.infrastructure.web.dashboard;

import com.scoutpro.backend.application.dashboard.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @Operation(summary = "Retorna resumo real do dashboard")
    @GetMapping("/resumo")
    public DashboardResumoResponse getResumo() {
        return dashboardService.getResumo();
    }
}
