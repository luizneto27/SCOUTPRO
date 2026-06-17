package com.scoutpro.backend.infrastructure.web.partida;

import com.scoutpro.backend.application.partida.DisputaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/partidas/{partidaId}/disputas")
public class DisputaController {

    private final DisputaService disputaService;

    public DisputaController(DisputaService disputaService) {
        this.disputaService = disputaService;
    }

    @Operation(summary = "Lista disputas de uma partida")
    @ApiResponse(responseCode = "404", description = "Partida inexistente")
    @GetMapping
    public List<DisputaResponse> listByPartida(@PathVariable Integer partidaId) {
        return disputaService.listByPartida(partidaId);
    }

    @Operation(summary = "Cria disputa de jogador em uma partida")
    @ApiResponse(responseCode = "201", description = "Disputa criada")
    @PostMapping
    public ResponseEntity<DisputaResponse> create(@PathVariable Integer partidaId, @Valid @RequestBody DisputaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(disputaService.create(partidaId, request));
    }

    @Operation(summary = "Atualiza disputa de jogador em uma partida")
    @PutMapping("/{jogadorId}")
    public DisputaResponse update(
            @PathVariable Integer partidaId,
            @PathVariable Integer jogadorId,
            @Valid @RequestBody DisputaRequest request
    ) {
        return disputaService.update(partidaId, jogadorId, request);
    }

    @Operation(summary = "Remove disputa de jogador em uma partida")
    @DeleteMapping("/{jogadorId}")
    public ResponseEntity<Void> delete(@PathVariable Integer partidaId, @PathVariable Integer jogadorId) {
        disputaService.delete(partidaId, jogadorId);
        return ResponseEntity.noContent().build();
    }
}
