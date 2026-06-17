package com.scoutpro.backend.infrastructure.persistence.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "jogador_patrocinios")
@Getter
@Setter
@NoArgsConstructor
public class JogadorPatrocinioEntity {

    @EmbeddedId
    @AttributeOverrides({
            @AttributeOverride(name = "jogadorId", column = @Column(name = "jogador_id")),
            @AttributeOverride(name = "marcaId", column = @Column(name = "marca_id")),
            @AttributeOverride(name = "dataInicio", column = @Column(name = "data_inicio"))
    })
    private JogadorPatrocinioId id;

    @Column(name = "data_fim")
    private LocalDate dataFim;

    @ManyToOne
    @JoinColumn(name = "marca_id", insertable = false, updatable = false)
    private MarcaEntity marca;

}
