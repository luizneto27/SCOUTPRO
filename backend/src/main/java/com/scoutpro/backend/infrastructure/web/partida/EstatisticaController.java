package com.scoutpro.backend.infrastructure.web.partida;

import com.scoutpro.backend.application.partida.EstatisticaService;
import io.swagger.v3.oas.annotations.Operation;
import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/estatisticas")
public class EstatisticaController {

    private final EstatisticaService estatisticaService;

    public EstatisticaController(EstatisticaService estatisticaService) {
        this.estatisticaService = estatisticaService;
    }

    @Operation(summary = "Lista estatisticas agregadas persistidas")
    @GetMapping
    public List<EstatisticaResponse> list(
            @RequestParam(required = false) Integer jogadorId,
            @RequestParam(required = false) Integer clubeId,
            @RequestParam(required = false) Integer competicaoEdicaoId
    ) {
        return estatisticaService.list(jogadorId, clubeId, competicaoEdicaoId);
    }
}
