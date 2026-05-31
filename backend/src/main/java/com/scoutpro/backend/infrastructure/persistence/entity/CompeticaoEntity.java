package com.scoutpro.backend.infrastructure.persistence.entity;

import com.scoutpro.backend.domain.enums.TipoCampeonato;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "competicoes")
@Getter
@Setter
public class CompeticaoEntity extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String nome;

    @ManyToOne
    @JoinColumn(name = "pais_id")
    private PaisEntity pais;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_campeonato", nullable = false, length = 20)
    private TipoCampeonato tipoCampeonato;
}

