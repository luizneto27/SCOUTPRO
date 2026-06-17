package com.scoutpro.backend.infrastructure.persistence.repository;

import com.scoutpro.backend.infrastructure.persistence.entity.TransferenciaEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransferenciaRepository extends JpaRepository<TransferenciaEntity, Integer> {

    List<TransferenciaEntity> findByJogadorIdOrderByDataTransferenciaDesc(Integer jogadorId);

}
