package com.scoutpro.backend.infrastructure.persistence.repository;

import com.scoutpro.backend.infrastructure.persistence.entity.DisputaEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.DisputaId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DisputaRepository extends JpaRepository<DisputaEntity, DisputaId> {

    List<DisputaEntity> findAllByPartidaIdOrderByJogadorNomeAsc(Integer partidaId);
}
