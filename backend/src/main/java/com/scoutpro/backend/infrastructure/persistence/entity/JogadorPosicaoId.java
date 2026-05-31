package com.scoutpro.backend.infrastructure.persistence.entity;

import java.io.Serializable;
import java.util.Objects;

public class JogadorPosicaoId implements Serializable {

    private Integer jogador;
    private Integer posicao;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof JogadorPosicaoId that)) return false;
        return Objects.equals(jogador, that.jogador) && Objects.equals(posicao, that.posicao);
    }

    @Override
    public int hashCode() {
        return Objects.hash(jogador, posicao);
    }
}
