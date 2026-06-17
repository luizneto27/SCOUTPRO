package com.scoutpro.backend.application.comparativo;

import com.scoutpro.backend.infrastructure.persistence.entity.ClubeEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.EstatisticaEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.JogadorEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.JogadorPosicaoEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.PosicaoEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.RelatorioEntity;
import com.scoutpro.backend.infrastructure.persistence.repository.EstatisticaRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.JogadorPosicaoRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.JogadorRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.RelatorioRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("ComparativoService Unit Tests")
class ComparativoServiceTest {

    @Mock
    private JogadorRepository jogadorRepository;
    @Mock
    private JogadorPosicaoRepository jogadorPosicaoRepository;
    @Mock
    private EstatisticaRepository estatisticaRepository;
    @Mock
    private RelatorioRepository relatorioRepository;

    @InjectMocks
    private ComparativoService comparativoService;

    private JogadorEntity jogadorA;
    private JogadorEntity jogadorB;

    @BeforeEach
    void setUp() {
        jogadorA = new JogadorEntity();
        jogadorA.setId(1);
        jogadorA.setNome("Joao Silva");
        jogadorA.setDataNascimento(LocalDate.now().minusYears(24));

        jogadorB = new JogadorEntity();
        jogadorB.setId(2);
        jogadorB.setNome("Pedro Santos");
        jogadorB.setDataNascimento(LocalDate.now().minusYears(21));
    }

    @Test
    @DisplayName("Should compare two players")
    void compareSuccess() {
        PosicaoEntity posicao = new PosicaoEntity();
        posicao.setNome("Atacante");
        JogadorPosicaoEntity posicaoEntity = new JogadorPosicaoEntity();
        posicaoEntity.setPosicao(posicao);

        ClubeEntity clube = new ClubeEntity();
        clube.setNome("Clube A");

        EstatisticaEntity estatisticaA = new EstatisticaEntity();
        estatisticaA.setJogador(jogadorA);
        estatisticaA.setClube(clube);
        estatisticaA.setJogos((short) 10);
        estatisticaA.setGols((short) 5);
        estatisticaA.setAssistencias((short) 2);

        EstatisticaEntity estatisticaB = new EstatisticaEntity();
        estatisticaB.setJogador(jogadorB);
        estatisticaB.setClube(clube);
        estatisticaB.setJogos((short) 12);
        estatisticaB.setGols((short) 7);
        estatisticaB.setAssistencias((short) 1);

        RelatorioEntity relatorioA = new RelatorioEntity();
        relatorioA.setJogador(jogadorA);
        relatorioA.setTecnica(new BigDecimal("8.0"));
        relatorioA.setTatica(new BigDecimal("7.0"));
        relatorioA.setFisico(new BigDecimal("7.5"));
        relatorioA.setMentalidade(new BigDecimal("8.2"));
        relatorioA.setPotencial(new BigDecimal("8.8"));
        relatorioA.setNotaGeral(new BigDecimal("7.9"));

        RelatorioEntity relatorioB = new RelatorioEntity();
        relatorioB.setJogador(jogadorB);
        relatorioB.setTecnica(new BigDecimal("7.5"));
        relatorioB.setTatica(new BigDecimal("7.8"));
        relatorioB.setFisico(new BigDecimal("8.2"));
        relatorioB.setMentalidade(new BigDecimal("7.9"));
        relatorioB.setPotencial(new BigDecimal("8.4"));
        relatorioB.setNotaGeral(new BigDecimal("8.0"));

        when(jogadorRepository.findById(1)).thenReturn(Optional.of(jogadorA));
        when(jogadorRepository.findById(2)).thenReturn(Optional.of(jogadorB));
        when(estatisticaRepository.findAll(any(Specification.class), any(Sort.class))).thenReturn(List.of(estatisticaA, estatisticaB));
        when(relatorioRepository.findByJogadorIdIn(List.of(1, 2))).thenReturn(List.of(relatorioA, relatorioB));
        when(jogadorPosicaoRepository.findByJogadorIdOrderByOrdemAsc(1)).thenReturn(List.of(posicaoEntity));
        when(jogadorPosicaoRepository.findByJogadorIdOrderByOrdemAsc(2)).thenReturn(List.of(posicaoEntity));

        var response = comparativoService.compare(1, 2, null);

        assertEquals("Joao Silva", response.atletaA().nome());
        assertEquals("Pedro Santos", response.atletaB().nome());
        assertEquals(6, response.radar().size());
        assertEquals(5, response.atletaA().gols());
        assertEquals(7, response.atletaB().gols());
    }
}
