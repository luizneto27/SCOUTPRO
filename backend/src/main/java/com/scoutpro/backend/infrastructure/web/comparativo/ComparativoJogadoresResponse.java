package com.scoutpro.backend.infrastructure.web.comparativo;

import java.util.List;

public record ComparativoJogadoresResponse(
        ComparativoAtletaResponse atletaA,
        ComparativoAtletaResponse atletaB,
        List<ComparativoRadarItemResponse> radar
) {
}
