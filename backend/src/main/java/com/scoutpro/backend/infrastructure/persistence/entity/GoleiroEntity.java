package com.scoutpro.backend.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "goleiros")
@Getter
@Setter
public class GoleiroEntity {

    @Id
    @Column(name = "id_jogador")
    private Integer jogadorId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id_jogador")
    private JogadorEntity jogador;

    @Column(name = "gols_sofridos")
    private Integer golsSofridos = 0;

    private Integer reposicoes = 0;

    @Column(name = "penaltis_defendidos")
    private Integer penaltisDefendidos = 0;

    @Column(name = "defesas_dificeis")
    private Integer defesasDificeis = 0;

    @Column(name = "jogos_sem_sofrer_gol")
    private Integer jogosSemSofrerGol = 0;
}

