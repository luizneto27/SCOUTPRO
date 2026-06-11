package com.scoutpro.backend.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "estatisticas")
@Getter
@Setter
public class EstatisticaEntity extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "jogador_id", nullable = false)
    private JogadorEntity jogador;

    @ManyToOne
    @JoinColumn(name = "clube_id", nullable = false)
    private ClubeEntity clube;

    @ManyToOne
    @JoinColumn(name = "competicao_edicao_id")
    private CompeticaoEdicaoEntity competicaoEdicao;

    @Column(nullable = false)
    private Short jogos = 0;

    @Column(nullable = false)
    private Integer minutos = 0;
}

