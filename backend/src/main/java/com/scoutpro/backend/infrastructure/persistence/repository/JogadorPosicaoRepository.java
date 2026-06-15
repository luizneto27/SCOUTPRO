package com.scoutpro.backend.infrastructure.persistence.repository;

import com.scoutpro.backend.infrastructure.persistence.entity.JogadorPosicaoEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.JogadorPosicaoId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JogadorPosicaoRepository extends JpaRepository<JogadorPosicaoEntity, JogadorPosicaoId> {
    List<JogadorPosicaoEntity> findByJogadorIdOrderByOrdemAsc(Integer jogadorId);
    void deleteByJogadorId(Integer jogadorId);
}

