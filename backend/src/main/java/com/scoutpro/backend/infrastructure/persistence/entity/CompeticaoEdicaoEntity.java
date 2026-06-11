package com.scoutpro.backend.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "competicoes_edicoes")
@Getter
@Setter
public class CompeticaoEdicaoEntity extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "competicao_id", nullable = false)
    private CompeticaoEntity competicao;

    @Column(nullable = false, length = 9)
    private String temporada;
}
