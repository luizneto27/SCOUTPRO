package com.scoutpro.backend.infrastructure.persistence.repository;

import com.scoutpro.backend.infrastructure.persistence.entity.JogadorPatrocinioEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.JogadorPatrocinioId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JogadorPatrocinioRepository extends JpaRepository<JogadorPatrocinioEntity, JogadorPatrocinioId> {

    List<JogadorPatrocinioEntity> findByIdJogadorId(Integer jogadorId);

}
