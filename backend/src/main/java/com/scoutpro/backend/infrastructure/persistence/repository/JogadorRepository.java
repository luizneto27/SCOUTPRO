package com.scoutpro.backend.infrastructure.persistence.repository;

import com.scoutpro.backend.infrastructure.persistence.entity.JogadorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface JogadorRepository extends JpaRepository<JogadorEntity, Integer>, JpaSpecificationExecutor<JogadorEntity> {
}

