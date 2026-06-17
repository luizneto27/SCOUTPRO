package com.scoutpro.backend.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "contratos")
@Getter
@Setter
public class ContratoEntity extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "id_jogador", nullable = false)
    private JogadorEntity jogador;

    @ManyToOne
    @JoinColumn(name = "clube_id", nullable = false)
    private ClubeEntity clube;

    @Column(name = "valor_contrato", precision = 15, scale = 2)
    private BigDecimal valorContrato;

    @Column(name = "tempo_contrato")
    private Integer tempoContrato;

    @Column(name = "multa_rescisoria", precision = 15, scale = 2)
    private BigDecimal multaRescisoria;

    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @Column(name = "data_fim")
    private LocalDate dataFim;

    @Column(nullable = false)
    private Boolean ativo = true;
}
