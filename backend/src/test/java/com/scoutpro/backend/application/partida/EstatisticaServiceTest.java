package com.scoutpro.backend.application.partida;

import com.scoutpro.backend.infrastructure.persistence.entity.ClubeEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.CompeticaoEdicaoEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.CompeticaoEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.EstatisticaEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.JogadorEntity;
import com.scoutpro.backend.infrastructure.persistence.repository.EstatisticaRepository;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("EstatisticaService Unit Tests")
class EstatisticaServiceTest {

    @Mock
    private EstatisticaRepository estatisticaRepository;

    @InjectMocks
    private EstatisticaService estatisticaService;

    private EstatisticaEntity estatistica;

    @BeforeEach
    void setUp() {
        JogadorEntity jogador = new JogadorEntity();
        jogador.setId(5);
        jogador.setNome("Lucas Pereira");

        ClubeEntity clube = new ClubeEntity();
        clube.setId(3);
        clube.setNome("Clube A");

        CompeticaoEntity competicao = new CompeticaoEntity();
        competicao.setId(11);
        competicao.setNome("Serie A");

        CompeticaoEdicaoEntity edicao = new CompeticaoEdicaoEntity();
        edicao.setId(21);
        edicao.setCompeticao(competicao);
        edicao.setTemporada("2026");

        estatistica = new EstatisticaEntity();
        estatistica.setId(1);
        estatistica.setJogador(jogador);
        estatistica.setClube(clube);
        estatistica.setCompeticaoEdicao(edicao);
        estatistica.setJogos((short) 12);
        estatistica.setMinutos(980);
        estatistica.setTitularidades((short) 10);
        estatistica.setGols((short) 4);
        estatistica.setAssistencias((short) 2);
    }

    @Test
    @DisplayName("Should list estatisticas with filters")
    void listSuccess() {
        when(estatisticaRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(estatistica)));

        var response = estatisticaService.list(5, 3, 21, PageRequest.of(0, 8));

        assertEquals(1, response.getContent().size());
        assertEquals("Lucas Pereira", response.getContent().get(0).jogadorNome());
        assertEquals("Serie A", response.getContent().get(0).campeonatoNome());
        assertEquals(Short.valueOf((short) 4), response.getContent().get(0).gols());
        verify(estatisticaRepository, times(1)).findAll(any(Specification.class), any(Pageable.class));
    }
}
