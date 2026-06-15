package com.scoutpro.backend.infrastructure.persistence.repository;

import com.scoutpro.backend.infrastructure.persistence.entity.CompeticaoEdicaoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompeticaoEdicaoRepository extends JpaRepository<CompeticaoEdicaoEntity, Integer> {
}
