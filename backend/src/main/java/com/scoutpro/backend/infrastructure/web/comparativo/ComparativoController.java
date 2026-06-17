package com.scoutpro.backend.infrastructure.web.comparativo;

import com.scoutpro.backend.application.comparativo.ComparativoService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/comparativo")
public class ComparativoController {

    private final ComparativoService comparativoService;

    public ComparativoController(ComparativoService comparativoService) {
        this.comparativoService = comparativoService;
    }

    @Operation(summary = "Compara dois jogadores com base em estatisticas e relatorios")
    @GetMapping("/jogadores")
    public ComparativoJogadoresResponse compare(
            @RequestParam @NotNull @Positive Integer jogadorAId,
            @RequestParam @NotNull @Positive Integer jogadorBId,
            @RequestParam(required = false) Integer competicaoEdicaoId
    ) {
        return comparativoService.compare(jogadorAId, jogadorBId, competicaoEdicaoId);
    }
}
