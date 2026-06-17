package com.scoutpro.backend.infrastructure.persistence.repository;

import com.scoutpro.backend.infrastructure.persistence.entity.CompeticaoEdicaoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompeticaoEdicaoRepository extends JpaRepository<CompeticaoEdicaoEntity, Integer> {

    List<CompeticaoEdicaoEntity> findAllByCompeticaoIdOrderByTemporadaDescIdDesc(Integer competicaoId);
}
