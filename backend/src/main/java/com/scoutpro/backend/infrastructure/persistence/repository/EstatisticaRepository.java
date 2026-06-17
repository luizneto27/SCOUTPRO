package com.scoutpro.backend.infrastructure.persistence.repository;

import com.scoutpro.backend.infrastructure.persistence.entity.EstatisticaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface EstatisticaRepository extends JpaRepository<EstatisticaEntity, Integer>, JpaSpecificationExecutor<EstatisticaEntity> {
}
