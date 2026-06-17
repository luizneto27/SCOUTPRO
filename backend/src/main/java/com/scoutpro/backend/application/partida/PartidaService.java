package com.scoutpro.backend.application.partida;

import com.scoutpro.backend.infrastructure.persistence.entity.CompeticaoEdicaoEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.PartidaEntity;
import com.scoutpro.backend.infrastructure.persistence.repository.CompeticaoEdicaoRepository;
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
    private final CompeticaoEdicaoRepository competicaoEdicaoRepository;

    public PartidaService(PartidaRepository partidaRepository,
                          CompeticaoEdicaoRepository competicaoEdicaoRepository) {
        this.partidaRepository = partidaRepository;
        this.competicaoEdicaoRepository = competicaoEdicaoRepository;
    }

    @Transactional
    public PartidaResponse create(PartidaRequest request) {
        CompeticaoEdicaoEntity competicaoEdicao = competicaoEdicaoRepository.findById(request.competicaoEdicaoId())
                .orElseThrow(() -> new EntityNotFoundException("Edição de campeonato com id " + request.competicaoEdicaoId() + " não encontrada"));

        PartidaEntity partida = new PartidaEntity();
        partida.setData(request.data());
        partida.setCompeticaoEdicao(competicaoEdicao);

        PartidaEntity saved = partidaRepository.save(partida);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<PartidaResponse> getByCampeonato(Integer campeonatoId, Pageable pageable) {
        Page<PartidaEntity> page = partidaRepository.findByCompeticaoEdicaoCompeticaoId(campeonatoId, pageable);
        return page.map(this::toResponse);
    }

    @Transactional
    public PartidaResponse update(Integer id, PartidaRequest request) {
        PartidaEntity partida = partidaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Partida com id " + id + " não encontrada"));

        CompeticaoEdicaoEntity competicaoEdicao = competicaoEdicaoRepository.findById(request.competicaoEdicaoId())
                .orElseThrow(() -> new EntityNotFoundException("Edição de campeonato com id " + request.competicaoEdicaoId() + " não encontrada"));

        partida.setData(request.data());
        partida.setCompeticaoEdicao(competicaoEdicao);

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
        Integer competicaoEdicaoId = entity.getCompeticaoEdicao() != null ? entity.getCompeticaoEdicao().getId() : null;
        return new PartidaResponse(entity.getId(), entity.getData(), competicaoEdicaoId);
    }
}
