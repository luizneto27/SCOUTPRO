package com.scoutpro.backend.application.campeonato;

import com.scoutpro.backend.infrastructure.persistence.entity.CompeticaoEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.CompeticaoEdicaoEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.PaisEntity;
import com.scoutpro.backend.infrastructure.persistence.repository.CompeticaoRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.CompeticaoEdicaoRepository;
import com.scoutpro.backend.infrastructure.web.campeonato.CampeonatoRequest;
import com.scoutpro.backend.infrastructure.web.campeonato.CampeonatoResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CampeonatoService {

    private final CompeticaoRepository competicaoRepository;
    private final CompeticaoEdicaoRepository competicaoEdicaoRepository;

    public CampeonatoService(CompeticaoRepository competicaoRepository,
                             CompeticaoEdicaoRepository competicaoEdicaoRepository) {
        this.competicaoRepository = competicaoRepository;
        this.competicaoEdicaoRepository = competicaoEdicaoRepository;
    }

    @Transactional
    public CampeonatoResponse create(CampeonatoRequest request) {
        CompeticaoEntity competicao = new CompeticaoEntity();
        competicao.setNome(request.nome());
        competicao.setTipoCampeonato(request.tipoCampeonato());

        PaisEntity pais = new PaisEntity();
        pais.setId(request.paisId());
        competicao.setPais(pais);

        CompeticaoEntity savedCompeticao = competicaoRepository.save(competicao);

        CompeticaoEdicaoEntity edicao = new CompeticaoEdicaoEntity();
        edicao.setCompeticao(savedCompeticao);
        edicao.setTemporada(request.temporada());
        edicao.setDivisao(request.divisao());
        edicao.setRanking(request.ranking());

        competicaoEdicaoRepository.save(edicao);

        return toResponse(savedCompeticao, edicao);
    }

    @Transactional(readOnly = true)
    public Page<CampeonatoResponse> getAll(Pageable pageable) {
        Page<CompeticaoEntity> page = competicaoRepository.findAll(pageable);
        return page.map(competicao -> {
            if (competicao.getEdicoes() != null && !competicao.getEdicoes().isEmpty()) {
                CompeticaoEdicaoEntity edicao = competicao.getEdicoes().get(0);
                return toResponse(competicao, edicao);
            }
            return toResponse(competicao, null);
        });
    }

    @Transactional
    public CampeonatoResponse update(Integer id, CampeonatoRequest request) {
        CompeticaoEntity competicao = competicaoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Campeonato com id " + id + " não encontrado"));

        competicao.setNome(request.nome());
        competicao.setTipoCampeonato(request.tipoCampeonato());

        PaisEntity pais = new PaisEntity();
        pais.setId(request.paisId());
        competicao.setPais(pais);

        CompeticaoEntity updatedCompeticao = competicaoRepository.save(competicao);

        CompeticaoEdicaoEntity edicao = null;
        if (updatedCompeticao.getEdicoes() != null && !updatedCompeticao.getEdicoes().isEmpty()) {
            edicao = updatedCompeticao.getEdicoes().get(0);
            edicao.setTemporada(request.temporada());
            edicao.setDivisao(request.divisao());
            edicao.setRanking(request.ranking());
            competicaoEdicaoRepository.save(edicao);
        }

        return toResponse(updatedCompeticao, edicao);
    }

    @Transactional
    public void delete(Integer id) {
        CompeticaoEntity competicao = competicaoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Campeonato com id " + id + " não encontrado"));

        competicaoRepository.delete(competicao);
    }

    private CampeonatoResponse toResponse(CompeticaoEntity competicao, CompeticaoEdicaoEntity edicao) {
        Integer paisId = competicao.getPais() != null ? competicao.getPais().getId() : null;
        String temporada = edicao != null ? edicao.getTemporada() : null;
        Integer divisao = edicao != null ? edicao.getDivisao() : null;
        Integer ranking = edicao != null ? edicao.getRanking() : null;

        return new CampeonatoResponse(
                competicao.getId(),
                competicao.getNome(),
                paisId,
                competicao.getTipoCampeonato(),
                temporada,
                divisao,
                ranking
        );
    }
}
