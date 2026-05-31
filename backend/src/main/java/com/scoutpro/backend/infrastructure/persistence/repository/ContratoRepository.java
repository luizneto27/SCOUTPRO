package com.scoutpro.backend.infrastructure.persistence.repository;

import com.scoutpro.backend.infrastructure.persistence.entity.ContratoEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContratoRepository extends JpaRepository<ContratoEntity, Integer> {
    Optional<ContratoEntity> findByJogadorIdAndAtivoTrue(Integer jogadorId);
}
