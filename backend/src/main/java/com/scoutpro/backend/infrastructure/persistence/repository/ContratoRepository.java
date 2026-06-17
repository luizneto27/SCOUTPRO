package com.scoutpro.backend.infrastructure.persistence.repository;

import com.scoutpro.backend.infrastructure.persistence.entity.ContratoEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.JogadorEntity;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ContratoRepository extends JpaRepository<ContratoEntity, Integer> {
    Optional<ContratoEntity> findByJogadorIdAndAtivoTrue(Integer jogadorId);

    List<ContratoEntity> findAllByJogadorIdOrderByDataInicioDescIdDesc(Integer jogadorId);

    @Query("""
            select c
            from ContratoEntity c
            where c.clube.cnpj = :cnpj
            order by c.ativo desc, c.dataInicio desc, c.id desc
            """)
    List<ContratoEntity> findAllByClubeCnpjOrderByAtivoDescDataInicioDesc(@Param("cnpj") String cnpj);

    @Query("""
            select distinct c.jogador
            from ContratoEntity c
            where c.clube.cnpj = :cnpj
              and c.ativo = true
            order by c.jogador.nome asc
            """)
    List<JogadorEntity> findJogadoresAtivosByClubeCnpj(@Param("cnpj") String cnpj);

    @Query("""
            select c
            from ContratoEntity c
            where c.jogador.id = :jogadorId
              and c.dataInicio <= :dataReferencia
              and (c.dataFim is null or c.dataFim >= :dataReferencia)
            order by c.dataInicio desc
            """)
    List<ContratoEntity> findContratosValidosByJogadorIdAndDataReferencia(
            @Param("jogadorId") Integer jogadorId,
            @Param("dataReferencia") LocalDate dataReferencia
    );
}
