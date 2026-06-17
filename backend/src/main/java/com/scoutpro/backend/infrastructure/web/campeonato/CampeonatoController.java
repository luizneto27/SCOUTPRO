package com.scoutpro.backend.infrastructure.web.campeonato;

import com.scoutpro.backend.application.campeonato.CampeonatoService;
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
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/campeonatos")
@SecurityRequirement(name = "bearerAuth")
public class CampeonatoController {

    private final CampeonatoService campeonatoService;

    public CampeonatoController(CampeonatoService campeonatoService) {
        this.campeonatoService = campeonatoService;
    }

    @Operation(summary = "Lista todos os campeonatos com paginação")
    @ApiResponse(responseCode = "200", description = "Lista de campeonatos")
    @GetMapping
    public ResponseEntity<Page<CampeonatoResponse>> getAll(
            @ParameterObject @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(campeonatoService.getAll(pageable));
    }

    @Operation(summary = "Lista as edições de um campeonato")
    @ApiResponse(responseCode = "200", description = "Lista de edições do campeonato")
    @ApiResponse(responseCode = "404", description = "Campeonato não encontrado")
    @GetMapping("/{id}/edicoes")
    public ResponseEntity<List<CompeticaoEdicaoResponse>> getEdicoesByCampeonato(@PathVariable Integer id) {
        return ResponseEntity.ok(campeonatoService.getEdicoesByCampeonato(id));
    }

    @Operation(summary = "Cria um novo campeonato")
    @ApiResponse(responseCode = "201", description = "Campeonato criado")
    @PostMapping
    public ResponseEntity<CampeonatoResponse> create(
            @Valid @RequestBody CampeonatoRequest request) {
        CampeonatoResponse response = campeonatoService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Atualiza um campeonato existente")
    @ApiResponse(responseCode = "200", description = "Campeonato atualizado")
    @ApiResponse(responseCode = "404", description = "Campeonato não encontrado")
    @PutMapping("/{id}")
    public ResponseEntity<CampeonatoResponse> update(
            @PathVariable Integer id,
            @Valid @RequestBody CampeonatoRequest request) {
        try {
            CampeonatoResponse response = campeonatoService.update(id, request);
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Deleta um campeonato")
    @ApiResponse(responseCode = "204", description = "Campeonato deletado")
    @ApiResponse(responseCode = "404", description = "Campeonato não encontrado")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        try {
            campeonatoService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
