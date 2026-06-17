package com.scoutpro.backend.infrastructure.web.jogador;

import com.scoutpro.backend.application.jogador.JogadorPatrocinioService;
import com.scoutpro.backend.infrastructure.web.patrocinios.dto.JogadorPatrocinioRequest;
import com.scoutpro.backend.infrastructure.web.patrocinios.dto.JogadorPatrocinioResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/v1/jogadores/{id}/patrocinios")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class JogadorPatrocinioController {

    private final JogadorPatrocinioService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Adicionar patrocínio ao jogador")
    public JogadorPatrocinioResponse create(@PathVariable("id") Integer jogadorId, @Valid @RequestBody JogadorPatrocinioRequest req) {
        return service.create(jogadorId, req);
    }

    @GetMapping
    @Operation(summary = "Listar patrocínios do jogador")
    public List<JogadorPatrocinioResponse> list(@PathVariable("id") Integer jogadorId) {
        return service.listByJogador(jogadorId);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remover patrocínio do jogador")
    public void delete(@PathVariable("id") Integer jogadorId,
                       @RequestParam("marcaId") Integer marcaId,
                       @RequestParam("dataInicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio) {
        service.delete(jogadorId, marcaId, dataInicio);
    }

}
