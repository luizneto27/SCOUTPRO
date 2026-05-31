package com.scoutpro.backend.infrastructure.persistence.entity;

import com.scoutpro.backend.domain.enums.UsuarioRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
public class UsuarioEntity extends BaseEntity {

    @Column(nullable = false, unique = true, length = 80)
    private String username;

    @Column(name = "nome_usuario", nullable = false, length = 120)
    private String nomeUsuario;

    @Column(nullable = false, unique = true, length = 14)
    private String cpf;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(length = 20)
    private String telefone;

    @Column(name = "senha_hash", nullable = false, length = 255)
    private String senhaHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private UsuarioRole role = UsuarioRole.USER;

    @Column(nullable = false)
    private Boolean ativo = true;
}
