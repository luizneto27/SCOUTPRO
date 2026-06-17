package com.scoutpro.backend.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "jogadores_linha")
@Getter
@Setter
public class JogadorLinhaEntity {

    @Id
    @Column(name = "id_jogador")
    private Integer jogadorId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id_jogador")
    private JogadorEntity jogador;

    private Integer gols = 0;

    private Integer desarmes = 0;

    @Column(name = "cartoes_amarelos")
    private Integer cartoesAmarelos = 0;

    @Column(name = "cartoes_vermelhos")
    private Integer cartoesVermelhos = 0;

    @Column(name = "passes_chave")
    private Integer passesChave = 0;

    @Column(name = "km_percorridos", precision = 8, scale = 2)
    private BigDecimal kmPercorridos = BigDecimal.ZERO;

    @Column(name = "nota_media", precision = 3, scale = 1)
    private BigDecimal notaMedia;

    @Column(name = "minutos_jogados")
    private Integer minutosJogados = 0;

    @Column(name = "faltas_sofridas")
    private Integer faltasSofridas = 0;

    @Column(name = "faltas_cometidas")
    private Integer faltasCometidas = 0;

    private Integer impedimentos = 0;

    @Column(name = "finalizacoes_gol")
    private Integer finalizacoesGol = 0;
}

