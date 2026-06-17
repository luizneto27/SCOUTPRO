package com.scoutpro.backend.infrastructure.web.cliente;

import com.scoutpro.backend.application.cliente.ClienteService;
import com.scoutpro.backend.infrastructure.web.cliente.dto.ClienteRequest;
import com.scoutpro.backend.infrastructure.web.cliente.dto.ClienteResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/clientes")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class ClienteController {

    private final ClienteService service;

    @GetMapping
    @Operation(summary = "Listar clientes")
    public List<ClienteResponse> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter cliente por id")
    public ClienteResponse get(@PathVariable Integer id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Criar cliente")
    public ClienteResponse create(@Valid @RequestBody ClienteRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar cliente")
    public ClienteResponse update(@PathVariable Integer id, @Valid @RequestBody ClienteRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Deletar cliente")
    public void delete(@PathVariable Integer id) {
        service.delete(id);
    }

}
