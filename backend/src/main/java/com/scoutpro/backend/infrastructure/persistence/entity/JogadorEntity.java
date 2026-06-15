package com.scoutpro.backend.infrastructure.persistence.entity;

import com.scoutpro.backend.domain.enums.TipoJogador;
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
@Table(name = "jogadores")
@Getter
@Setter
public class JogadorEntity extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(name = "nome_completo", length = 200)
    private String nomeCompleto;

    @Column(name = "perfil_texto")
    private String perfilTexto;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    @ManyToOne
    @JoinColumn(name = "pais_id")
    private PaisEntity pais;

    @Column(name = "valor_mercado", precision = 15, scale = 2)
    private BigDecimal valorMercado;

    private Integer titulos = 0;

    @Column(name = "altura_cm")
    private Short alturaCm;

    @Column(name = "peso_kg")
    private Short pesoKg;

    @Column(name = "pe_dominante", length = 1)
    private String peDominante;

    @ManyToOne
    @JoinColumn(name = "id_empresario")
    private EmpresarioEntity empresario;

    @Column(nullable = false)
    private Boolean ativo = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_jogador", nullable = false, length = 20)
    private TipoJogador tipoJogador = TipoJogador.JOGADOR_LINHA;
}
