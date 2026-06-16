package com.scoutpro.backend.infrastructure.persistence.repository;

import com.scoutpro.backend.infrastructure.persistence.entity.ContratoEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.JogadorEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ContratoRepository extends JpaRepository<ContratoEntity, Integer> {
    Optional<ContratoEntity> findByJogadorIdAndAtivoTrue(Integer jogadorId);

    @Query("""
            select distinct c.jogador
            from ContratoEntity c
            where c.clube.cnpj = :cnpj
              and c.ativo = true
            order by c.jogador.nome asc
            """)
    List<JogadorEntity> findJogadoresAtivosByClubeCnpj(@Param("cnpj") String cnpj);
}
