package com.scoutpro.backend.infrastructure.persistence.entity;

import com.scoutpro.backend.domain.enums.TipoTransferencia;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "transferencias")
@Getter
@Setter
public class TransferenciaEntity extends BaseEntity {

    @Column(name = "data_transferencia", nullable = false)
    private LocalDate dataTransferencia;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoTransferencia tipo;

    @ManyToOne
    @JoinColumn(name = "id_jogador", nullable = false)
    private JogadorEntity jogador;

    @ManyToOne
    @JoinColumn(name = "clube_origem_id", nullable = false)
    private ClubeEntity clubeOrigem;

    @ManyToOne
    @JoinColumn(name = "clube_destino_id", nullable = false)
    private ClubeEntity clubeDestino;
}

