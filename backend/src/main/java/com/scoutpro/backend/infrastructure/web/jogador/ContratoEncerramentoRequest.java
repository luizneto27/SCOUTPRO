package com.scoutpro.backend.infrastructure.web.jogador;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.PastOrPresent;
import java.time.LocalDate;

public record ContratoEncerramentoRequest(
        @PastOrPresent @JsonProperty("data_fim") LocalDate dataFim
) {
}
