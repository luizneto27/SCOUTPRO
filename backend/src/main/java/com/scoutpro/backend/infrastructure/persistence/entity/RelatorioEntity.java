package com.scoutpro.backend.infrastructure.persistence.entity;

import com.scoutpro.backend.domain.enums.RecomendacaoRelatorio;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "relatorios")
@Getter
@Setter
public class RelatorioEntity extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "jogador_id", nullable = false)
    private JogadorEntity jogador;

    @ManyToOne
    @JoinColumn(name = "scout_id", nullable = false)
    private ScoutEntity scout;

    @ManyToOne
    @JoinColumn(name = "clube_id")
    private ClubeEntity clube;

    @ManyToOne
    @JoinColumn(name = "competicao_edicao_id")
    private CompeticaoEdicaoEntity competicaoEdicao;

    @Column(name = "data_observacao", nullable = false)
    private LocalDate dataObservacao;

    @Column(nullable = false, precision = 4, scale = 1)
    private BigDecimal tecnica;

    @Column(nullable = false, precision = 4, scale = 1)
    private BigDecimal tatica;

    @Column(nullable = false, precision = 4, scale = 1)
    private BigDecimal fisico;

    @Column(nullable = false, precision = 4, scale = 1)
    private BigDecimal mentalidade;

    @Column(nullable = false, precision = 4, scale = 1)
    private BigDecimal potencial;

    @Column(name = "nota_geral", insertable = false, updatable = false, precision = 4, scale = 1)
    private BigDecimal notaGeral;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private RecomendacaoRelatorio recomendacao;
}

