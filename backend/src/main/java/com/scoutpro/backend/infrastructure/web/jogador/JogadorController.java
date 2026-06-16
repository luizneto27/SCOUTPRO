package com.scoutpro.backend.infrastructure.web.jogador;

import com.scoutpro.backend.application.jogador.JogadorService;
import com.scoutpro.backend.application.jogador.ContratoService;
import com.scoutpro.backend.domain.enums.TipoJogador;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
@RequestMapping("/api/v1/jogadores")
public class JogadorController {

    private final JogadorService jogadorService;
    private final ContratoService contratoService;

    public JogadorController(JogadorService jogadorService, ContratoService contratoService) {
        this.jogadorService = jogadorService;
        this.contratoService = contratoService;
    }

    @Operation(summary = "Cria jogador")
    @ApiResponse(responseCode = "201", description = "Jogador criado")
    @ApiResponse(responseCode = "400", description = "Payload invalido")
    @ApiResponse(responseCode = "404", description = "Pais, empresario ou posicao inexistente")
    @PostMapping
    public ResponseEntity<JogadorResponse> create(@Valid @RequestBody CreateJogadorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jogadorService.create(request));
    }

    @Operation(summary = "Lista jogadores")
    @GetMapping
    public Page<JogadorResponse> list(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) Boolean ativo,
            @RequestParam(required = false) TipoJogador tipoJogador,
            @RequestParam(required = false) Integer paisId,
            Pageable pageable
    ) {
        return jogadorService.list(nome, ativo, tipoJogador, paisId, pageable);
    }

    @Operation(summary = "Consulta jogador por id")
    @ApiResponse(responseCode = "404", description = "Jogador inexistente")
    @GetMapping("/{id}")
    public JogadorResponse getById(@PathVariable Integer id) {
        return jogadorService.getById(id);
    }

    @Operation(summary = "Atualiza jogador")
    @ApiResponse(responseCode = "200", description = "Jogador atualizado")
    @ApiResponse(responseCode = "400", description = "Payload invalido")
    @ApiResponse(responseCode = "404", description = "Jogador, pais, empresario ou posicao inexistente")
    @ApiResponse(responseCode = "409", description = "Especializacao incompativel com tipo de jogador")
    @PutMapping("/{id}")
    public JogadorResponse update(@PathVariable Integer id, @Valid @RequestBody UpdateJogadorRequest request) {
        return jogadorService.update(id, request);
    }

    @Operation(summary = "Inativa jogador")
    @ApiResponse(responseCode = "204", description = "Jogador inativado")
    @ApiResponse(responseCode = "404", description = "Jogador inexistente")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        jogadorService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Cria detalhe de jogador de linha")
    @ApiResponse(responseCode = "201", description = "Detalhe criado")
    @ApiResponse(responseCode = "404", description = "Jogador inexistente")
    @ApiResponse(responseCode = "409", description = "Detalhe ja existe ou tipo incompativel")
    @PostMapping("/{id}/jogador-linha")
    public ResponseEntity<JogadorLinhaResponse> createJogadorLinha(
            @PathVariable Integer id,
            @Valid @RequestBody JogadorLinhaRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jogadorService.createJogadorLinha(id, request));
    }

    @Operation(summary = "Atualiza detalhe de jogador de linha")
    @ApiResponse(responseCode = "200", description = "Detalhe atualizado")
    @ApiResponse(responseCode = "404", description = "Detalhe inexistente")
    @PutMapping("/{id}/jogador-linha")
    public JogadorLinhaResponse updateJogadorLinha(
            @PathVariable Integer id,
            @Valid @RequestBody JogadorLinhaRequest request
    ) {
        return jogadorService.updateJogadorLinha(id, request);
    }

    @Operation(summary = "Cria detalhe de goleiro")
    @ApiResponse(responseCode = "201", description = "Detalhe criado")
    @ApiResponse(responseCode = "404", description = "Jogador inexistente")
    @ApiResponse(responseCode = "409", description = "Detalhe ja existe ou tipo incompativel")
    @PostMapping("/{id}/goleiro")
    public ResponseEntity<GoleiroResponse> createGoleiro(
            @PathVariable Integer id,
            @Valid @RequestBody GoleiroRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jogadorService.createGoleiro(id, request));
    }

    @Operation(summary = "Atualiza detalhe de goleiro")
    @ApiResponse(responseCode = "200", description = "Detalhe atualizado")
    @ApiResponse(responseCode = "404", description = "Detalhe inexistente")
    @PutMapping("/{id}/goleiro")
    public GoleiroResponse updateGoleiro(
            @PathVariable Integer id,
            @Valid @RequestBody GoleiroRequest request
    ) {
        return jogadorService.updateGoleiro(id, request);
    }

    @Operation(summary = "Cria contrato para jogador")
    @ApiResponse(responseCode = "201", description = "Contrato criado")
    @ApiResponse(responseCode = "400", description = "Payload invalido")
    @ApiResponse(responseCode = "404", description = "Jogador ou clube inexistente")
    @ApiResponse(responseCode = "409", description = "Jogador ja possui contrato ativo")
    @PostMapping("/{id}/contratos")
    public ResponseEntity<ContratoResponse> createContrato(
            @PathVariable Integer id,
            @Valid @RequestBody ContratoRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contratoService.create(id, request));
    }
}
