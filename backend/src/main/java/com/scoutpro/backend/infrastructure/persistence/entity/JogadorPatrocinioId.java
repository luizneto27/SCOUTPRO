package com.scoutpro.backend.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Embeddable
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class JogadorPatrocinioId implements Serializable {

    @Column(name = "jogador_id")
    private Integer jogadorId;

    @Column(name = "marca_id")
    private Integer marcaId;

    @Column(name = "data_inicio")
    private LocalDate dataInicio;

    public Integer getJogadorId() {
        return jogadorId;
    }

    public Integer getMarcaId() {
        return marcaId;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

}
