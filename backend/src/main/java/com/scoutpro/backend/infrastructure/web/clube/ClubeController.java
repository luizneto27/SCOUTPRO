package com.scoutpro.backend.infrastructure.web.clube;

import com.scoutpro.backend.application.clube.ClubeService;
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
@RequestMapping("/api/v1/clubes")
public class ClubeController {

    private final ClubeService clubeService;

    public ClubeController(ClubeService clubeService) {
        this.clubeService = clubeService;
    }

    @Operation(summary = "Cria clube")
    @ApiResponse(responseCode = "201", description = "Clube criado")
    @ApiResponse(responseCode = "400", description = "Payload invalido")
    @ApiResponse(responseCode = "404", description = "Pais inexistente")
    @ApiResponse(responseCode = "409", description = "CNPJ ja cadastrado")
    @PostMapping
    public ResponseEntity<ClubeResponse> create(@Valid @RequestBody ClubeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clubeService.create(request));
    }

    @Operation(summary = "Lista clubes")
    @GetMapping
    public List<ClubeResponse> list() {
        return clubeService.list();
    }

    @Operation(summary = "Consulta clube por CNPJ")
    @ApiResponse(responseCode = "404", description = "Clube inexistente")
    @GetMapping("/{cnpj}")
    public ClubeResponse getByCnpj(@PathVariable String cnpj) {
        return clubeService.getByCnpj(cnpj);
    }

    @Operation(summary = "Atualiza clube")
    @ApiResponse(responseCode = "200", description = "Clube atualizado")
    @ApiResponse(responseCode = "400", description = "Payload invalido")
    @ApiResponse(responseCode = "404", description = "Clube ou pais inexistente")
    @ApiResponse(responseCode = "409", description = "CNPJ ja cadastrado")
    @PutMapping("/{cnpj}")
    public ClubeResponse update(@PathVariable String cnpj, @Valid @RequestBody ClubeRequest request) {
        return clubeService.update(cnpj, request);
    }

    @Operation(summary = "Remove clube")
    @ApiResponse(responseCode = "204", description = "Clube removido")
    @ApiResponse(responseCode = "404", description = "Clube inexistente")
    @DeleteMapping("/{cnpj}")
    public ResponseEntity<Void> delete(@PathVariable String cnpj) {
        clubeService.delete(cnpj);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Lista jogadores ativos do clube")
    @ApiResponse(responseCode = "200", description = "Lista de jogadores retornada")
    @ApiResponse(responseCode = "404", description = "Clube inexistente")
    @GetMapping("/{cnpj}/jogadores")
    public List<ClubeJogadorResponse> listJogadores(@PathVariable String cnpj) {
        return clubeService.listJogadores(cnpj);
    }
}
