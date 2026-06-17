package com.scoutpro.backend.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "disputa")
@Getter
@Setter
public class DisputaEntity {

    @EmbeddedId
    private DisputaId id = new DisputaId();

    @MapsId("jogadorId")
    @ManyToOne
    @JoinColumn(name = "id_jogador", nullable = false)
    private JogadorEntity jogador;

    @MapsId("partidaId")
    @ManyToOne
    @JoinColumn(name = "id_partida", nullable = false)
    private PartidaEntity partida;

    @Column(name = "gols_partida", nullable = false)
    private Integer golsPartida = 0;

    @Column(name = "finalizacoes_gol_partida", nullable = false)
    private Integer finalizacoesGolPartida = 0;

    @Column(name = "faltas_cometidas_partida", nullable = false)
    private Integer faltasCometidasPartida = 0;

    @Column(name = "faltas_sofridas_partida", nullable = false)
    private Integer faltasSofridasPartida = 0;

    @Column(name = "cartoes_amarelos_partida", nullable = false)
    private Integer cartoesAmarelosPartida = 0;

    @Column(name = "cartoes_vermelhos_partida", nullable = false)
    private Integer cartoesVermelhosPartida = 0;

    @Column(name = "impedimentos_partida", nullable = false)
    private Integer impedimentosPartida = 0;

    @Column(name = "km_percorridos_partida", nullable = false, precision = 8, scale = 2)
    private BigDecimal kmPercorridosPartida = BigDecimal.ZERO;

    @Column(name = "desarmes_partida", nullable = false)
    private Integer desarmesPartida = 0;

    @Column(name = "passes_chave_partida", nullable = false)
    private Integer passesChavePartida = 0;

    @Column(name = "minutos_jogados_partida", nullable = false)
    private Integer minutosJogadosPartida = 0;

    @Column(name = "nota_partida", precision = 3, scale = 1)
    private BigDecimal notaPartida;

    @Column(name = "reposicoes_partida", nullable = false)
    private Integer reposicoesPartida = 0;

    @Column(name = "gols_sofridos_partida", nullable = false)
    private Integer golsSofridosPartida = 0;

    @Column(name = "penaltis_defendidos_partida", nullable = false)
    private Integer penaltisDefendidosPartida = 0;

    @Column(name = "defesas_dificeis_partida", nullable = false)
    private Integer defesasDificeisPartida = 0;

    @Column(name = "clean_sheet_partida", nullable = false)
    private Boolean cleanSheetPartida = false;
}
