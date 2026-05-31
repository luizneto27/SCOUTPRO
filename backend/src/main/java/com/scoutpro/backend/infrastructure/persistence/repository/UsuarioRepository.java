package com.scoutpro.backend.infrastructure.persistence.repository;

import com.scoutpro.backend.infrastructure.persistence.entity.UsuarioEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<UsuarioEntity, Integer> {
    Optional<UsuarioEntity> findByUsernameAndAtivoTrue(String username);
    boolean existsByUsername(String username);
    boolean existsByCpf(String cpf);
    boolean existsByEmail(String email);
    boolean existsByRole(com.scoutpro.backend.domain.enums.UsuarioRole role);
    boolean existsByRoleAndAtivoTrue(com.scoutpro.backend.domain.enums.UsuarioRole role);
    Optional<UsuarioEntity> findFirstByRoleOrderByIdAsc(com.scoutpro.backend.domain.enums.UsuarioRole role);
}
