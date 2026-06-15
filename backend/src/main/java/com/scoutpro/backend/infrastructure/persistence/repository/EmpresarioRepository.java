package com.scoutpro.backend.infrastructure.persistence.repository;

import com.scoutpro.backend.infrastructure.persistence.entity.EmpresarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmpresarioRepository extends JpaRepository<EmpresarioEntity, Integer> {
}

