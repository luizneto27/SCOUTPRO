package com.scoutpro.backend.infrastructure.web.patrocinios.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class JogadorPatrocinioRequest {

    @NotNull
    private Integer marcaId;

    @NotNull
    private LocalDate dataInicio;

    private LocalDate dataFim;

}
