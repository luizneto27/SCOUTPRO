package com.scoutpro.backend.infrastructure.web.patrocinios.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class JogadorPatrocinioResponse {

    private Integer jogadorId;
    private Integer marcaId;
    private String marcaNome;
    private LocalDate dataInicio;
    private LocalDate dataFim;

}
