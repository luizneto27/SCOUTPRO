package com.scoutpro.backend.infrastructure.web.jogador;

import com.scoutpro.backend.application.jogador.ContratoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/contratos")
public class ContratoController {

    private final ContratoService contratoService;

    public ContratoController(ContratoService contratoService) {
        this.contratoService = contratoService;
    }

    @Operation(summary = "Atualiza contrato")
    @PutMapping("/{id}")
    public ContratoResponse update(@PathVariable Integer id, @Valid @RequestBody ContratoRequest request) {
        return contratoService.update(id, request);
    }

    @Operation(summary = "Encerra contrato")
    @PatchMapping("/{id}/encerrar")
    public ContratoResponse encerrar(@PathVariable Integer id, @Valid @RequestBody ContratoEncerramentoRequest request) {
        return contratoService.encerrar(id, request.dataFim());
    }

    @Operation(summary = "Remove contrato")
    @ApiResponse(responseCode = "204", description = "Contrato removido")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        contratoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
