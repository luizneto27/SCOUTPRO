package com.scoutpro.backend.infrastructure.persistence.repository;

import com.scoutpro.backend.infrastructure.persistence.entity.JogadorLinhaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JogadorLinhaRepository extends JpaRepository<JogadorLinhaEntity, Integer> {
}

