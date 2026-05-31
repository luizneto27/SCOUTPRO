package com.scoutpro.backend.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "jogador_posicoes")
@IdClass(JogadorPosicaoId.class)
@Getter
@Setter
public class JogadorPosicaoEntity {

    @Id
    @ManyToOne
    @JoinColumn(name = "jogador_id", nullable = false)
    private JogadorEntity jogador;

    @Id
    @ManyToOne
    @JoinColumn(name = "posicao_id", nullable = false)
    private PosicaoEntity posicao;

    @Column(nullable = false)
    private Short ordem;
}

