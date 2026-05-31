package com.scoutpro.backend.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "scouts")
@Getter
@Setter
public class ScoutEntity extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(length = 100)
    private String regiao;

    @Column(nullable = false)
    private Boolean ativo = true;
}

