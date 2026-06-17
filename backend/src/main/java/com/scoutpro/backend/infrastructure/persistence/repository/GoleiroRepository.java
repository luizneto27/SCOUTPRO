package com.scoutpro.backend.infrastructure.persistence.repository;

import com.scoutpro.backend.infrastructure.persistence.entity.GoleiroEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoleiroRepository extends JpaRepository<GoleiroEntity, Integer> {
}

