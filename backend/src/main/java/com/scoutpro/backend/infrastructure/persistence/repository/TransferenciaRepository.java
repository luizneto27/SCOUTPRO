package com.scoutpro.backend.infrastructure.persistence.repository;

import com.scoutpro.backend.infrastructure.persistence.entity.TransferenciaEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransferenciaRepository extends JpaRepository<TransferenciaEntity, Integer> {

    List<TransferenciaEntity> findByJogadorIdOrderByDataTransferenciaDesc(Integer jogadorId);

    List<TransferenciaEntity> findAllByJogadorIdOrderByDataTransferenciaDescIdDesc(Integer jogadorId);

    @Query("""
            select t
            from TransferenciaEntity t
            where t.clubeOrigem.cnpj = :cnpj
               or t.clubeDestino.cnpj = :cnpj
            order by t.dataTransferencia desc, t.id desc
            """)
    List<TransferenciaEntity> findAllByClubeCnpjOrderByDataTransferenciaDescIdDesc(@Param("cnpj") String cnpj);
}
