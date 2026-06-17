package com.scoutpro.backend.infrastructure.persistence.repository;

import com.scoutpro.backend.infrastructure.persistence.entity.ClienteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClienteRepository extends JpaRepository<ClienteEntity, Integer> {

    @Query(value = "SELECT COUNT(*) FROM monitora m WHERE m.id_cliente = :clienteId", nativeQuery = true)
    Long countAtletasMonitoradosByClienteId(@Param("clienteId") Integer clienteId);

}
