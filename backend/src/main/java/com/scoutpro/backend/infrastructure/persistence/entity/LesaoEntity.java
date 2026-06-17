package com.scoutpro.backend.infrastructure.persistence.entity;

import com.scoutpro.backend.domain.enums.GravidadeLesao;
import com.scoutpro.backend.domain.enums.StatusRecuperacaoLesao;
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
@Table(name = "lesoes")
@Getter
@Setter
public class LesaoEntity extends BaseEntity {

    @Column(name = "data_lesao", nullable = false)
    private LocalDate dataLesao;

    @Column(name = "tipo_lesao", nullable = false, length = 100)
    private String tipoLesao;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private GravidadeLesao gravidade;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_recuperacao", length = 20)
    private StatusRecuperacaoLesao statusRecuperacao;

    @Column(name = "tempo_recuperacao")
    private Integer tempoRecuperacao;

    @ManyToOne
    @JoinColumn(name = "id_jogador", nullable = false)
    private JogadorEntity jogador;
}
