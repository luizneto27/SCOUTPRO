package com.scoutpro.backend.application.jogador;

import com.scoutpro.backend.infrastructure.persistence.entity.JogadorEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.JogadorPatrocinioEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.JogadorPatrocinioId;
import com.scoutpro.backend.infrastructure.persistence.entity.MarcaEntity;
import com.scoutpro.backend.infrastructure.persistence.repository.JogadorPatrocinioRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.MarcaRepository;
import com.scoutpro.backend.infrastructure.web.patrocinios.dto.JogadorPatrocinioRequest;
import com.scoutpro.backend.infrastructure.web.patrocinios.dto.JogadorPatrocinioResponse;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class JogadorPatrocinioService {

    private final JogadorPatrocinioRepository repo;
    private final MarcaRepository marcaRepository;

    @Transactional
    public JogadorPatrocinioResponse create(Integer jogadorId, JogadorPatrocinioRequest req) {
        if (req.getDataFim() != null && req.getDataFim().isBefore(req.getDataInicio())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "dataFim must be >= dataInicio");
        }

        JogadorPatrocinioId id = new JogadorPatrocinioId(jogadorId, req.getMarcaId(), req.getDataInicio());
        JogadorPatrocinioEntity entity = new JogadorPatrocinioEntity();
        entity.setId(id);
        entity.setDataFim(req.getDataFim());
        // marca lazy: try to fetch name
        MarcaEntity m = marcaRepository.findById(req.getMarcaId()).orElse(null);
        entity.setMarca(m);
        JogadorPatrocinioEntity saved = repo.save(entity);
        String marcaNome = saved.getMarca() != null ? saved.getMarca().getNome() : null;
        return new JogadorPatrocinioResponse(jogadorId, req.getMarcaId(), marcaNome, req.getDataInicio(), req.getDataFim());
    }

    @Transactional(readOnly = true)
    public List<JogadorPatrocinioResponse> listByJogador(Integer jogadorId) {
        return repo.findByIdJogadorId(jogadorId).stream()
                .map(e -> new JogadorPatrocinioResponse(e.getId().getJogadorId(), e.getId().getMarcaId(), e.getMarca() != null ? e.getMarca().getNome() : null, e.getId().getDataInicio(), e.getDataFim()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void delete(Integer jogadorId, Integer marcaId, java.time.LocalDate dataInicio) {
        JogadorPatrocinioId id = new JogadorPatrocinioId(jogadorId, marcaId, dataInicio);
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        repo.deleteById(id);
    }

}
