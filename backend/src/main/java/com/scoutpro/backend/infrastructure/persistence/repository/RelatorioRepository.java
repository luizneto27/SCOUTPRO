package com.scoutpro.backend.infrastructure.persistence.repository;

import com.scoutpro.backend.infrastructure.persistence.entity.RelatorioEntity;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RelatorioRepository extends JpaRepository<RelatorioEntity, Integer> {

    List<RelatorioEntity> findByDataObservacaoGreaterThanEqualOrderByDataObservacaoAscIdAsc(LocalDate dataObservacao);

    List<RelatorioEntity> findTop20ByOrderByDataObservacaoDescIdDesc();

    @Query("""
            select r
            from RelatorioEntity r
            where r.jogador.id in :jogadorIds
              and (:competicaoEdicaoId is null or r.competicaoEdicao.id = :competicaoEdicaoId)
            order by r.dataObservacao desc, r.id desc
            """)
    List<RelatorioEntity> findByJogadorIdsAndCompeticaoEdicaoId(
            @Param("jogadorIds") List<Integer> jogadorIds,
            @Param("competicaoEdicaoId") Integer competicaoEdicaoId
    );
}
