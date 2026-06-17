package com.scoutpro.backend.infrastructure.persistence.repository;

import com.scoutpro.backend.infrastructure.persistence.entity.ClubeEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClubeRepository extends JpaRepository<ClubeEntity, Integer> {

    Optional<ClubeEntity> findByCnpj(String cnpj);

    boolean existsByCnpj(String cnpj);

    boolean existsByCnpjAndIdNot(String cnpj, Integer id);

    List<ClubeEntity> findAllByOrderByNomeAsc();

    @Query(value = """
            SELECT *
            FROM clubes
            WHERE regexp_replace(cnpj, '\\D', '', 'g') = :cnpj
            LIMIT 1
            """, nativeQuery = true)
    Optional<ClubeEntity> findByNormalizedCnpj(@Param("cnpj") String cnpj);

    @Query(value = """
            SELECT CASE WHEN COUNT(*) > 0 THEN TRUE ELSE FALSE END
            FROM clubes
            WHERE regexp_replace(cnpj, '\\D', '', 'g') = :cnpj
            """, nativeQuery = true)
    boolean existsByNormalizedCnpj(@Param("cnpj") String cnpj);

    @Query(value = """
            SELECT CASE WHEN COUNT(*) > 0 THEN TRUE ELSE FALSE END
            FROM clubes
            WHERE regexp_replace(cnpj, '\\D', '', 'g') = :cnpj
              AND id <> :id
            """, nativeQuery = true)
    boolean existsByNormalizedCnpjAndIdNot(@Param("cnpj") String cnpj, @Param("id") Integer id);
}
