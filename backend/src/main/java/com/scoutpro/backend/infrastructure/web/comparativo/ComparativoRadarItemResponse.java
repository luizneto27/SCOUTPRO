package com.scoutpro.backend.infrastructure.web.comparativo;

import java.math.BigDecimal;

public record ComparativoRadarItemResponse(
        String subject,
        String atletaA,
        BigDecimal valorAtletaA,
        String atletaB,
        BigDecimal valorAtletaB
) {
}
