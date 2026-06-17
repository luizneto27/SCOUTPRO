package com.scoutpro.backend.application.dashboard;

import com.scoutpro.backend.domain.enums.GravidadeLesao;
import com.scoutpro.backend.domain.enums.StatusRecuperacaoLesao;
import com.scoutpro.backend.infrastructure.persistence.entity.ClubeEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.EstatisticaEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.JogadorEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.JogadorPosicaoEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.LesaoEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.PosicaoEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.RelatorioEntity;
import com.scoutpro.backend.infrastructure.persistence.repository.ClubeRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.CompeticaoRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.EstatisticaRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.JogadorPosicaoRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.JogadorRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.LesaoRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.RelatorioRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("DashboardService Unit Tests")
class DashboardServiceTest {

    @Mock
    private JogadorRepository jogadorRepository;
    @Mock
    private ClubeRepository clubeRepository;
    @Mock
    private CompeticaoRepository competicaoRepository;
    @Mock
    private LesaoRepository lesaoRepository;
    @Mock
    private RelatorioRepository relatorioRepository;
    @Mock
    private EstatisticaRepository estatisticaRepository;
    @Mock
    private JogadorPosicaoRepository jogadorPosicaoRepository;

    @InjectMocks
    private DashboardService dashboardService;

    private JogadorEntity jogador;
    private EstatisticaEntity estatistica;
    private LesaoEntity lesao;
    private RelatorioEntity relatorio;

    @BeforeEach
    void setUp() {
        jogador = new JogadorEntity();
        jogador.setId(1);
        jogador.setNome("Joao Silva");

        ClubeEntity clube = new ClubeEntity();
        clube.setId(2);
        clube.setNome("Clube A");

        estatistica = new EstatisticaEntity();
        estatistica.setJogador(jogador);
        estatistica.setClube(clube);
        estatistica.setJogos((short) 10);
        estatistica.setGols((short) 4);
        estatistica.setAssistencias((short) 2);
        estatistica.setDesarmes((short) 3);
        estatistica.setMinutos(900);

        lesao = new LesaoEntity();
        lesao.setJogador(jogador);
        lesao.setDataLesao(LocalDate.now().minusDays(2));
        lesao.setTipoLesao("Entorse");
        lesao.setGravidade(GravidadeLesao.GRAVE);
        lesao.setStatusRecuperacao(StatusRecuperacaoLesao.EM_RECUPERACAO);

        relatorio = new RelatorioEntity();
        relatorio.setJogador(jogador);
        relatorio.setDataObservacao(LocalDate.now().minusDays(1));
        relatorio.setNotaGeral(new BigDecimal("8.4"));
        relatorio.setTecnica(new BigDecimal("8.0"));
        relatorio.setTatica(new BigDecimal("7.5"));
        relatorio.setFisico(new BigDecimal("8.5"));
        relatorio.setMentalidade(new BigDecimal("8.0"));
        relatorio.setPotencial(new BigDecimal("8.2"));
    }

    @Test
    @DisplayName("Should build dashboard summary from repositories")
    void getResumoSuccess() {
        PosicaoEntity posicao = new PosicaoEntity();
        posicao.setNome("Meia");
        JogadorPosicaoEntity jogadorPosicao = new JogadorPosicaoEntity();
        jogadorPosicao.setPosicao(posicao);

        when(jogadorRepository.countByAtivoTrue()).thenReturn(12L);
        when(clubeRepository.count()).thenReturn(5L);
        when(competicaoRepository.count()).thenReturn(3L);
        when(lesaoRepository.findAll()).thenReturn(List.of(lesao));
        when(relatorioRepository.findByDataObservacaoGreaterThanEqualOrderByDataObservacaoAscIdAsc(org.mockito.ArgumentMatchers.any()))
                .thenReturn(List.of(relatorio));
        when(estatisticaRepository.findAll()).thenReturn(List.of(estatistica));
        when(jogadorPosicaoRepository.findByJogadorIdOrderByOrdemAsc(1)).thenReturn(List.of(jogadorPosicao));

        var response = dashboardService.getResumo();

        assertEquals(12L, response.atletasAtivos());
        assertEquals(1L, response.lesoesEmRecuperacao());
        assertEquals(1, response.atletasDestaque().size());
        assertEquals(2, response.alertasRecentes().size());
        assertEquals("Joao Silva", response.atletasDestaque().get(0).nome());
    }
}
