package com.scoutpro.backend.application.partida;

import com.scoutpro.backend.infrastructure.persistence.entity.CompeticaoEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.PartidaEntity;
import com.scoutpro.backend.infrastructure.persistence.repository.CompeticaoRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.PartidaRepository;
import com.scoutpro.backend.infrastructure.web.partida.PartidaRequest;
import com.scoutpro.backend.infrastructure.web.partida.PartidaResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PartidaService {

    private final PartidaRepository partidaRepository;
    private final CompeticaoRepository competicaoRepository;

    public PartidaService(PartidaRepository partidaRepository, CompeticaoRepository competicaoRepository) {
        this.partidaRepository = partidaRepository;
        this.competicaoRepository = competicaoRepository;
    }

    @Transactional
    public PartidaResponse create(PartidaRequest request) {
        CompeticaoEntity competicao = competicaoRepository.findById(request.campeonatoId())
                .orElseThrow(() -> new EntityNotFoundException("Campeonato com id " + request.campeonatoId() + " não encontrado"));

        PartidaEntity partida = new PartidaEntity();
        partida.setData(request.data());
        partida.setCompeticao(competicao);

        PartidaEntity saved = partidaRepository.save(partida);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<PartidaResponse> getByCampeonato(Integer campeonatoId, Pageable pageable) {
        Page<PartidaEntity> page = partidaRepository.findByCompeticaoId(campeonatoId, pageable);
        return page.map(this::toResponse);
    }

    @Transactional
    public PartidaResponse update(Integer id, PartidaRequest request) {
        PartidaEntity partida = partidaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Partida com id " + id + " não encontrada"));

        CompeticaoEntity competicao = competicaoRepository.findById(request.campeonatoId())
                .orElseThrow(() -> new EntityNotFoundException("Campeonato com id " + request.campeonatoId() + " não encontrado"));

        partida.setData(request.data());
        partida.setCompeticao(competicao);

        PartidaEntity updated = partidaRepository.save(partida);
        return toResponse(updated);
    }

    @Transactional
    public void delete(Integer id) {
        PartidaEntity partida = partidaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Partida com id " + id + " não encontrada"));
        partidaRepository.delete(partida);
    }

    private PartidaResponse toResponse(PartidaEntity entity) {
        Integer campeonatoId = entity.getCompeticao() != null ? entity.getCompeticao().getId() : null;
        return new PartidaResponse(entity.getId(), entity.getData(), campeonatoId);
    }
}
