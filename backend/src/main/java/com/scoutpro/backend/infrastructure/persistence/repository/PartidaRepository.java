package com.scoutpro.backend.infrastructure.persistence.repository;

import com.scoutpro.backend.infrastructure.persistence.entity.PartidaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PartidaRepository extends JpaRepository<PartidaEntity, Integer> {

    Page<PartidaEntity> findByCompeticaoEdicaoCompeticaoId(Integer competicaoId, Pageable pageable);

    Page<PartidaEntity> findByCompeticaoEdicaoId(Integer competicaoEdicaoId, Pageable pageable);
}
