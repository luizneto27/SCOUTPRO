package com.scoutpro.backend.infrastructure.web.campeonato;

import com.scoutpro.backend.application.campeonato.CampeonatoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/competicoes-edicoes")
@SecurityRequirement(name = "bearerAuth")
public class CompeticaoEdicaoController {

    private final CampeonatoService campeonatoService;

    public CompeticaoEdicaoController(CampeonatoService campeonatoService) {
        this.campeonatoService = campeonatoService;
    }

    @Operation(summary = "Busca uma edição de campeonato por id")
    @ApiResponse(responseCode = "200", description = "Detalhe da edição do campeonato")
    @ApiResponse(responseCode = "404", description = "Edição de campeonato não encontrada")
    @GetMapping("/{id}")
    public ResponseEntity<CompeticaoEdicaoResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(campeonatoService.getEdicaoById(id));
    }
}
