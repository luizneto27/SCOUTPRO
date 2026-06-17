package com.scoutpro.backend.infrastructure.web.cliente.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ClienteResponse {

    private Integer id;
    private String nome;
    private Long atletasMonitorados;

}
