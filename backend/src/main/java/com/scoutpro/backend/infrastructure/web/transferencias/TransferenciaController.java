package com.scoutpro.backend.infrastructure.web.transferencias;

import com.scoutpro.backend.application.transferencia.TransferenciaService;
import com.scoutpro.backend.infrastructure.web.transferencias.dto.TransferenciaRequest;
import com.scoutpro.backend.infrastructure.web.transferencias.dto.TransferenciaResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/transferencias")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class TransferenciaController {

    private final TransferenciaService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registrar transferência")
    public TransferenciaResponse create(@Valid @RequestBody TransferenciaRequest req) {
        return service.create(req);
    }

    @GetMapping("/jogador/{id}")
    @Operation(summary = "Histórico de transferências do jogador")
    public List<TransferenciaResponse> history(@PathVariable("id") Integer jogadorId) {
        return service.listByJogador(jogadorId);
    }

}
