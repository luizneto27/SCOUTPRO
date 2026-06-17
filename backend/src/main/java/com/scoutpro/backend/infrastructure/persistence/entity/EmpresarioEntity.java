package com.scoutpro.backend.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "empresarios")
@Getter
@Setter
public class EmpresarioEntity extends BaseEntity {

    @Column(name = "nome_empresarial", nullable = false, length = 100)
    private String nomeEmpresarial;
}

