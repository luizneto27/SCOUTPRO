package com.scoutpro.backend.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "posicoes")
@Getter
@Setter
public class PosicaoEntity extends BaseEntity {

    @Column(nullable = false, length = 50)
    private String nome;

    @Column(nullable = false, unique = true, length = 5)
    private String sigla;
}

