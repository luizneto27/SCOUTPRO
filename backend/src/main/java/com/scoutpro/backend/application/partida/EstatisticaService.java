package com.scoutpro.backend.application.partida;

import com.scoutpro.backend.infrastructure.persistence.entity.CompeticaoEdicaoEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.EstatisticaEntity;
import com.scoutpro.backend.infrastructure.persistence.repository.EstatisticaRepository;
import com.scoutpro.backend.infrastructure.web.partida.EstatisticaResponse;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EstatisticaService {

    private final EstatisticaRepository estatisticaRepository;

    public EstatisticaService(EstatisticaRepository estatisticaRepository) {
        this.estatisticaRepository = estatisticaRepository;
    }

    @Transactional(readOnly = true)
    public List<EstatisticaResponse> list(Integer jogadorId, Integer clubeId, Integer competicaoEdicaoId) {
        return estatisticaRepository.findAll(buildSpecification(jogadorId, clubeId, competicaoEdicaoId), sort())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private Specification<EstatisticaEntity> buildSpecification(Integer jogadorId, Integer clubeId, Integer competicaoEdicaoId) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (jogadorId != null) {
                predicates.add(criteriaBuilder.equal(root.get("jogador").get("id"), jogadorId));
            }
            if (clubeId != null) {
                predicates.add(criteriaBuilder.equal(root.get("clube").get("id"), clubeId));
            }
            if (competicaoEdicaoId != null) {
                predicates.add(criteriaBuilder.equal(root.get("competicaoEdicao").get("id"), competicaoEdicaoId));
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private Sort sort() {
        return Sort.by(
                Sort.Order.asc("jogador.nome"),
                Sort.Order.desc("jogos"),
                Sort.Order.desc("gols"),
                Sort.Order.asc("id")
        );
    }

    private EstatisticaResponse toResponse(EstatisticaEntity entity) {
        CompeticaoEdicaoEntity edicao = entity.getCompeticaoEdicao();
        Integer campeonatoId = edicao != null && edicao.getCompeticao() != null ? edicao.getCompeticao().getId() : null;
        String campeonatoNome = edicao != null && edicao.getCompeticao() != null ? edicao.getCompeticao().getNome() : null;
        String temporada = edicao != null ? edicao.getTemporada() : null;

        return new EstatisticaResponse(
                entity.getId(),
                entity.getJogador().getId(),
                entity.getJogador().getNome(),
                entity.getClube().getId(),
                entity.getClube().getNome(),
                edicao != null ? edicao.getId() : null,
                campeonatoId,
                campeonatoNome,
                temporada,
                entity.getJogos(),
                entity.getMinutos(),
                entity.getTitularidades(),
                entity.getGols(),
                entity.getAssistencias(),
                entity.getChutes(),
                entity.getChutesGol(),
                entity.getInterceptacoes(),
                entity.getDesarmes(),
                entity.getAmarelos(),
                entity.getVermelhos()
        );
    }
}
