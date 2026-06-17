package com.scoutpro.backend.infrastructure.persistence.repository;

import com.scoutpro.backend.infrastructure.persistence.entity.LesaoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface LesaoRepository extends JpaRepository<LesaoEntity, Integer>, JpaSpecificationExecutor<LesaoEntity> {
}
