package com.scoutpro.backend.infrastructure.persistence.repository;

import com.scoutpro.backend.infrastructure.persistence.entity.PosicaoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PosicaoRepository extends JpaRepository<PosicaoEntity, Integer> {
}

