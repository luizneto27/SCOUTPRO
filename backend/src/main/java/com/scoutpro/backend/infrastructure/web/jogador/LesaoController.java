package com.scoutpro.backend.infrastructure.web.jogador;

import com.scoutpro.backend.application.jogador.LesaoService;
import com.scoutpro.backend.domain.enums.GravidadeLesao;
import com.scoutpro.backend.domain.enums.StatusRecuperacaoLesao;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/lesoes")
public class LesaoController {

    private final LesaoService lesaoService;

    public LesaoController(LesaoService lesaoService) {
        this.lesaoService = lesaoService;
    }

    @Operation(summary = "Cria registro de lesao")
    @ApiResponse(responseCode = "201", description = "Lesao criada")
    @PostMapping
    public ResponseEntity<LesaoResponse> create(@Valid @RequestBody LesaoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(lesaoService.create(request));
    }

    @Operation(summary = "Lista lesoes")
    @GetMapping
    public List<LesaoResponse> list(
            @RequestParam(required = false) Integer jogadorId,
            @RequestParam(required = false) GravidadeLesao gravidade,
            @RequestParam(required = false) StatusRecuperacaoLesao statusRecuperacao
    ) {
        return lesaoService.list(jogadorId, gravidade, statusRecuperacao);
    }

    @Operation(summary = "Consulta lesao por id")
    @ApiResponse(responseCode = "404", description = "Lesao inexistente")
    @GetMapping("/{id}")
    public LesaoResponse getById(@PathVariable Integer id) {
        return lesaoService.getById(id);
    }

    @Operation(summary = "Atualiza lesao")
    @PutMapping("/{id}")
    public LesaoResponse update(@PathVariable Integer id, @Valid @RequestBody LesaoRequest request) {
        return lesaoService.update(id, request);
    }

    @Operation(summary = "Remove lesao")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        lesaoService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Resumo agregado de lesoes")
    @GetMapping("/resumo")
    public LesaoResumoResponse getResumo(@RequestParam(required = false) Integer jogadorId) {
        return lesaoService.getResumo(jogadorId);
    }
}
