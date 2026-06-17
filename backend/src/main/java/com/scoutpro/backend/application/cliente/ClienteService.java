package com.scoutpro.backend.application.cliente;

import com.scoutpro.backend.infrastructure.persistence.entity.ClienteEntity;
import com.scoutpro.backend.infrastructure.persistence.repository.ClienteRepository;
import com.scoutpro.backend.infrastructure.web.cliente.dto.ClienteRequest;
import com.scoutpro.backend.infrastructure.web.cliente.dto.ClienteResponse;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;

    @Transactional(readOnly = true)
    public List<ClienteResponse> findAll() {
        return clienteRepository.findAll().stream()
                .map(c -> new ClienteResponse(c.getId(), c.getNome(), clienteRepository.countAtletasMonitoradosByClienteId(c.getId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClienteResponse findById(Integer id) {
        ClienteEntity c = clienteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return new ClienteResponse(c.getId(), c.getNome(), clienteRepository.countAtletasMonitoradosByClienteId(c.getId()));
    }

    @Transactional
    public ClienteResponse create(ClienteRequest req) {
        ClienteEntity c = new ClienteEntity();
        c.setNome(req.getNome());
        ClienteEntity saved = clienteRepository.save(c);
        return new ClienteResponse(saved.getId(), saved.getNome(), clienteRepository.countAtletasMonitoradosByClienteId(saved.getId()));
    }

    @Transactional
    public ClienteResponse update(Integer id, ClienteRequest req) {
        ClienteEntity c = clienteRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        c.setNome(req.getNome());
        ClienteEntity saved = clienteRepository.save(c);
        return new ClienteResponse(saved.getId(), saved.getNome(), clienteRepository.countAtletasMonitoradosByClienteId(saved.getId()));
    }

    @Transactional
    public void delete(Integer id) {
        if (!clienteRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        clienteRepository.deleteById(id);
    }

}
