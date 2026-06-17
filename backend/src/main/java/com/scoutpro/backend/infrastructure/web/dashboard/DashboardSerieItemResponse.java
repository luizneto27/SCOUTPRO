package com.scoutpro.backend.infrastructure.web.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DashboardSerieItemResponse(
        LocalDate data,
        BigDecimal valor
) {
}
