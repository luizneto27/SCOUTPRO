package com.scoutpro.backend.infrastructure.web.partida;

import com.scoutpro.backend.application.partida.PartidaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.persistence.EntityNotFoundException;
import org.springdoc.core.annotations.ParameterObject;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@SecurityRequirement(name = "bearerAuth")
public class PartidaController {

    private final PartidaService partidaService;

    public PartidaController(PartidaService partidaService) {
        this.partidaService = partidaService;
    }

    @Operation(summary = "Lista partidas de um campeonato com paginação")
    @ApiResponse(responseCode = "200", description = "Lista de partidas")
    @GetMapping("/campeonatos/{id}/partidas")
    public ResponseEntity<Page<PartidaResponse>> getByCampeonato(
            @PathVariable Integer id,
            @RequestParam(required = false) Integer competicaoEdicaoId,
            @ParameterObject @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(partidaService.getByCampeonato(id, competicaoEdicaoId, pageable));
    }

    @Operation(summary = "Cria uma nova partida")
    @ApiResponse(responseCode = "201", description = "Partida criada")
    @PostMapping("/partidas")
    public ResponseEntity<PartidaResponse> create(@Valid @RequestBody PartidaRequest request) {
        PartidaResponse response = partidaService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Atualiza uma partida existente")
    @ApiResponse(responseCode = "200", description = "Partida atualizada")
    @ApiResponse(responseCode = "404", description = "Partida não encontrada")
    @PutMapping("/partidas/{id}")
    public ResponseEntity<PartidaResponse> update(@PathVariable Integer id, @Valid @RequestBody PartidaRequest request) {
        try {
            PartidaResponse response = partidaService.update(id, request);
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Deleta uma partida")
    @ApiResponse(responseCode = "204", description = "Partida deletada")
    @ApiResponse(responseCode = "404", description = "Partida não encontrada")
    @DeleteMapping("/partidas/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        try {
            partidaService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
