package com.scoutpro.backend.application.dashboard;

import com.scoutpro.backend.domain.enums.GravidadeLesao;
import com.scoutpro.backend.domain.enums.StatusRecuperacaoLesao;
import com.scoutpro.backend.infrastructure.persistence.entity.EstatisticaEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.JogadorPosicaoEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.LesaoEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.RelatorioEntity;
import com.scoutpro.backend.infrastructure.persistence.repository.ClubeRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.CompeticaoRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.EstatisticaRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.JogadorPosicaoRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.JogadorRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.LesaoRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.RelatorioRepository;
import com.scoutpro.backend.infrastructure.web.dashboard.DashboardAlertaResponse;
import com.scoutpro.backend.infrastructure.web.dashboard.DashboardAtletaDestaqueResponse;
import com.scoutpro.backend.infrastructure.web.dashboard.DashboardDistribuicaoItemResponse;
import com.scoutpro.backend.infrastructure.web.dashboard.DashboardResumoResponse;
import com.scoutpro.backend.infrastructure.web.dashboard.DashboardSerieItemResponse;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private final JogadorRepository jogadorRepository;
    private final ClubeRepository clubeRepository;
    private final CompeticaoRepository competicaoRepository;
    private final LesaoRepository lesaoRepository;
    private final RelatorioRepository relatorioRepository;
    private final EstatisticaRepository estatisticaRepository;
    private final JogadorPosicaoRepository jogadorPosicaoRepository;

    public DashboardService(
            JogadorRepository jogadorRepository,
            ClubeRepository clubeRepository,
            CompeticaoRepository competicaoRepository,
            LesaoRepository lesaoRepository,
            RelatorioRepository relatorioRepository,
            EstatisticaRepository estatisticaRepository,
            JogadorPosicaoRepository jogadorPosicaoRepository
    ) {
        this.jogadorRepository = jogadorRepository;
        this.clubeRepository = clubeRepository;
        this.competicaoRepository = competicaoRepository;
        this.lesaoRepository = lesaoRepository;
        this.relatorioRepository = relatorioRepository;
        this.estatisticaRepository = estatisticaRepository;
        this.jogadorPosicaoRepository = jogadorPosicaoRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResumoResponse getResumo() {
        long atletasAtivos = jogadorRepository.countByAtivoTrue();
        long clubes = clubeRepository.count();
        long campeonatos = competicaoRepository.count();

        List<LesaoEntity> lesoes = lesaoRepository.findAll();
        List<RelatorioEntity> relatoriosRecentes = relatorioRepository.findTop20ByOrderByDataObservacaoDescIdDesc();
        List<EstatisticaEntity> estatisticas = estatisticaRepository.findAll();

        return new DashboardResumoResponse(
                atletasAtivos,
                clubes,
                campeonatos,
                lesoes.stream().filter(this::isLesaoAberta).count(),
                toSeriePerformance(relatoriosRecentes),
                toStatusSaude(lesoes),
                toAtletasDestaque(estatisticas),
                toAlertas(lesoes, relatoriosRecentes)
        );
    }

    private List<DashboardSerieItemResponse> toSeriePerformance(List<RelatorioEntity> relatorios) {
        Map<LocalDate, List<BigDecimal>> agrupado = new LinkedHashMap<>();
        for (RelatorioEntity relatorio : relatorios) {
            agrupado.computeIfAbsent(relatorio.getDataObservacao(), key -> new ArrayList<>())
                    .add(relatorio.getNotaGeral());
        }

        return agrupado.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .skip(Math.max(0, agrupado.size() - 7L))
                .map(entry -> new DashboardSerieItemResponse(
                        entry.getKey(),
                        average(entry.getValue())
                ))
                .toList();
    }

    private List<DashboardDistribuicaoItemResponse> toStatusSaude(List<LesaoEntity> lesoes) {
        long emRecuperacao = lesoes.stream()
                .filter(lesao -> lesao.getStatusRecuperacao() == StatusRecuperacaoLesao.EM_RECUPERACAO)
                .count();
        long recuperado = lesoes.stream()
                .filter(lesao -> lesao.getStatusRecuperacao() == StatusRecuperacaoLesao.RECUPERADO)
                .count();
        long recaida = lesoes.stream()
                .filter(lesao -> lesao.getStatusRecuperacao() == StatusRecuperacaoLesao.RECAIDA)
                .count();

        return List.of(
                new DashboardDistribuicaoItemResponse("Em Recuperacao", emRecuperacao),
                new DashboardDistribuicaoItemResponse("Recuperado", recuperado),
                new DashboardDistribuicaoItemResponse("Recaida", recaida)
        );
    }

    private List<DashboardAtletaDestaqueResponse> toAtletasDestaque(List<EstatisticaEntity> estatisticas) {
        Map<Integer, DashboardAtletaAccumulator> acumulado = new LinkedHashMap<>();
        for (EstatisticaEntity estatistica : estatisticas) {
            DashboardAtletaAccumulator atual = acumulado.computeIfAbsent(
                    estatistica.getJogador().getId(),
                    key -> new DashboardAtletaAccumulator(
                            estatistica.getJogador().getId(),
                            estatistica.getJogador().getNome(),
                            resolvePosicaoPrincipal(estatistica.getJogador().getId()),
                            estatistica.getClube().getNome()
                    )
            );
            atual.jogos += defaultShort(estatistica.getJogos());
            atual.gols += defaultShort(estatistica.getGols());
            atual.assistencias += defaultShort(estatistica.getAssistencias());
            atual.minutos += defaultInteger(estatistica.getMinutos());
            atual.desarmes += defaultShort(estatistica.getDesarmes());
        }

        return acumulado.values().stream()
                .peek(item -> item.indicePerformance = calculateIndice(item))
                .sorted(Comparator.comparing(DashboardAtletaAccumulator::indicePerformance).reversed())
                .limit(5)
                .map(item -> new DashboardAtletaDestaqueResponse(
                        item.jogadorId,
                        item.nome,
                        item.posicao,
                        item.clubeNome,
                        item.jogos,
                        item.gols,
                        item.assistencias,
                        item.indicePerformance
                ))
                .toList();
    }

    private List<DashboardAlertaResponse> toAlertas(List<LesaoEntity> lesoes, List<RelatorioEntity> relatoriosRecentes) {
        List<DashboardAlertaResponse> alertas = new ArrayList<>();

        lesoes.stream()
                .filter(this::isLesaoAberta)
                .sorted(Comparator.comparing(LesaoEntity::getDataLesao).reversed())
                .limit(3)
                .forEach(lesao -> alertas.add(new DashboardAlertaResponse(
                        "Lesao ativa",
                        lesao.getJogador().getNome(),
                        lesao.getTipoLesao() + " - " + labelGravidade(lesao.getGravidade()),
                        lesao.getDataLesao(),
                        lesao.getGravidade() == GravidadeLesao.GRAVE ? "critico" : "atencao"
                )));

        if (alertas.size() < 5) {
            relatoriosRecentes.stream()
                    .filter(relatorio -> relatorio.getNotaGeral() != null && relatorio.getNotaGeral().compareTo(new BigDecimal("8.0")) >= 0)
                    .sorted(Comparator.comparing(RelatorioEntity::getDataObservacao).reversed())
                    .limit(5 - alertas.size())
                    .forEach(relatorio -> alertas.add(new DashboardAlertaResponse(
                            "Destaque de performance",
                            relatorio.getJogador().getNome(),
                            "Nota geral " + relatorio.getNotaGeral(),
                            relatorio.getDataObservacao(),
                            "positivo"
                    )));
        }

        return alertas;
    }

    private boolean isLesaoAberta(LesaoEntity lesao) {
        return lesao.getStatusRecuperacao() != StatusRecuperacaoLesao.RECUPERADO;
    }

    private String labelGravidade(GravidadeLesao gravidade) {
        if (gravidade == null) {
            return "Nao informada";
        }
        return switch (gravidade) {
            case LEVE -> "leve";
            case MODERADA -> "moderada";
            case GRAVE -> "grave";
        };
    }

    private BigDecimal average(List<BigDecimal> values) {
        if (values == null || values.isEmpty()) {
            return BigDecimal.ZERO;
        }
        BigDecimal total = values.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        return total.divide(BigDecimal.valueOf(values.size()), 1, RoundingMode.HALF_UP);
    }

    private String resolvePosicaoPrincipal(Integer jogadorId) {
        return jogadorPosicaoRepository.findByJogadorIdOrderByOrdemAsc(jogadorId).stream()
                .findFirst()
                .map(JogadorPosicaoEntity::getPosicao)
                .map(posicao -> posicao.getNome())
                .orElse("Sem posicao");
    }

    private BigDecimal calculateIndice(DashboardAtletaAccumulator item) {
        BigDecimal indice = BigDecimal.valueOf(item.gols * 4L)
                .add(BigDecimal.valueOf(item.assistencias * 3L))
                .add(BigDecimal.valueOf(item.desarmes))
                .add(BigDecimal.valueOf(item.minutos).divide(new BigDecimal("90"), 1, RoundingMode.HALF_UP));
        return indice.setScale(1, RoundingMode.HALF_UP);
    }

    private int defaultShort(Short value) {
        return value == null ? 0 : value;
    }

    private int defaultInteger(Integer value) {
        return value == null ? 0 : value;
    }

    private static final class DashboardAtletaAccumulator {
        private final Integer jogadorId;
        private final String nome;
        private final String posicao;
        private final String clubeNome;
        private int jogos;
        private int gols;
        private int assistencias;
        private int minutos;
        private int desarmes;
        private BigDecimal indicePerformance = BigDecimal.ZERO;

        private DashboardAtletaAccumulator(Integer jogadorId, String nome, String posicao, String clubeNome) {
            this.jogadorId = jogadorId;
            this.nome = nome;
            this.posicao = posicao;
            this.clubeNome = clubeNome;
        }

        private BigDecimal indicePerformance() {
            return indicePerformance;
        }
    }
}
