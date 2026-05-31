package com.scoutpro.backend.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "clubes")
@Getter
@Setter
public class ClubeEntity extends BaseEntity {

    @Column(nullable = false, unique = true, length = 20)
    private String cnpj;

    @Column(nullable = false, length = 100)
    private String nome;

    @ManyToOne
    @JoinColumn(name = "pais_id")
    private PaisEntity pais;

    @Column(length = 100)
    private String cidade;

    private LocalDate fundacao;
}
