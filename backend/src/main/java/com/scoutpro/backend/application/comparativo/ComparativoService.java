package com.scoutpro.backend.application.comparativo;

import com.scoutpro.backend.application.common.ResourceNotFoundException;
import com.scoutpro.backend.infrastructure.persistence.entity.EstatisticaEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.JogadorEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.JogadorPosicaoEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.RelatorioEntity;
import com.scoutpro.backend.infrastructure.persistence.repository.EstatisticaRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.JogadorPosicaoRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.JogadorRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.RelatorioRepository;
import com.scoutpro.backend.infrastructure.web.comparativo.ComparativoAtletaResponse;
import com.scoutpro.backend.infrastructure.web.comparativo.ComparativoJogadoresResponse;
import com.scoutpro.backend.infrastructure.web.comparativo.ComparativoRadarItemResponse;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ComparativoService {

    private final JogadorRepository jogadorRepository;
    private final JogadorPosicaoRepository jogadorPosicaoRepository;
    private final EstatisticaRepository estatisticaRepository;
    private final RelatorioRepository relatorioRepository;

    public ComparativoService(
            JogadorRepository jogadorRepository,
            JogadorPosicaoRepository jogadorPosicaoRepository,
            EstatisticaRepository estatisticaRepository,
            RelatorioRepository relatorioRepository
    ) {
        this.jogadorRepository = jogadorRepository;
        this.jogadorPosicaoRepository = jogadorPosicaoRepository;
        this.estatisticaRepository = estatisticaRepository;
        this.relatorioRepository = relatorioRepository;
    }

    @Transactional(readOnly = true)
    public ComparativoJogadoresResponse compare(Integer jogadorAId, Integer jogadorBId, Integer competicaoEdicaoId) {
        if (jogadorAId.equals(jogadorBId)) {
            throw new IllegalArgumentException("os jogadores do comparativo devem ser distintos");
        }

        JogadorEntity jogadorA = findJogador(jogadorAId);
        JogadorEntity jogadorB = findJogador(jogadorBId);

        List<Integer> jogadorIds = List.of(jogadorAId, jogadorBId);
        List<EstatisticaEntity> estatisticas = estatisticaRepository.findAll(buildSpecification(jogadorIds, competicaoEdicaoId), Sort.by("id"));
        Map<Integer, List<EstatisticaEntity>> estatisticasPorJogador = estatisticas.stream()
                .collect(Collectors.groupingBy(item -> item.getJogador().getId()));

        List<RelatorioEntity> relatorios = relatorioRepository.findByJogadorIdsAndCompeticaoEdicaoId(jogadorIds, competicaoEdicaoId);
        Map<Integer, List<RelatorioEntity>> relatoriosPorJogador = relatorios.stream()
                .collect(Collectors.groupingBy(item -> item.getJogador().getId()));

        ComparativoAtletaResponse atletaA = toComparativoAtleta(jogadorA, estatisticasPorJogador.get(jogadorAId), relatoriosPorJogador.get(jogadorAId));
        ComparativoAtletaResponse atletaB = toComparativoAtleta(jogadorB, estatisticasPorJogador.get(jogadorBId), relatoriosPorJogador.get(jogadorBId));

        return new ComparativoJogadoresResponse(
                atletaA,
                atletaB,
                buildRadar(atletaA, atletaB)
        );
    }

    private Specification<EstatisticaEntity> buildSpecification(List<Integer> jogadorIds, Integer competicaoEdicaoId) {
        return (root, query, criteriaBuilder) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(root.get("jogador").get("id").in(jogadorIds));
            if (competicaoEdicaoId != null) {
                predicates.add(criteriaBuilder.equal(root.get("competicaoEdicao").get("id"), competicaoEdicaoId));
            }
            return criteriaBuilder.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    private JogadorEntity findJogador(Integer jogadorId) {
        return jogadorRepository.findById(jogadorId)
                .orElseThrow(() -> new ResourceNotFoundException("jogador nao encontrado"));
    }

    private ComparativoAtletaResponse toComparativoAtleta(
            JogadorEntity jogador,
            List<EstatisticaEntity> estatisticas,
            List<RelatorioEntity> relatorios
    ) {
        EstatisticaAccumulator estatistica = accumulateEstatisticas(estatisticas);
        RelatorioAccumulator relatorio = accumulateRelatorios(relatorios);

        return new ComparativoAtletaResponse(
                jogador.getId(),
                jogador.getNome(),
                resolvePosicaoPrincipal(jogador.getId()),
                calculateIdade(jogador.getDataNascimento()),
                jogador.getValorMercado(),
                estatistica.clubeNome,
                estatistica.jogos,
                estatistica.minutos,
                estatistica.gols,
                estatistica.assistencias,
                estatistica.chutesGol,
                estatistica.desarmes,
                estatistica.amarelos,
                estatistica.vermelhos,
                relatorio.tecnica,
                relatorio.tatica,
                relatorio.fisico,
                relatorio.mentalidade,
                relatorio.potencial,
                relatorio.notaGeral
        );
    }

    private List<ComparativoRadarItemResponse> buildRadar(ComparativoAtletaResponse atletaA, ComparativoAtletaResponse atletaB) {
        return List.of(
                new ComparativoRadarItemResponse("Tecnica", atletaA.nome(), atletaA.tecnicaMedia(), atletaB.nome(), atletaB.tecnicaMedia()),
                new ComparativoRadarItemResponse("Tatica", atletaA.nome(), atletaA.taticaMedia(), atletaB.nome(), atletaB.taticaMedia()),
                new ComparativoRadarItemResponse("Fisico", atletaA.nome(), atletaA.fisicoMedio(), atletaB.nome(), atletaB.fisicoMedio()),
                new ComparativoRadarItemResponse("Mentalidade", atletaA.nome(), atletaA.mentalidadeMedia(), atletaB.nome(), atletaB.mentalidadeMedia()),
                new ComparativoRadarItemResponse("Potencial", atletaA.nome(), atletaA.potencialMedio(), atletaB.nome(), atletaB.potencialMedio()),
                new ComparativoRadarItemResponse("Nota Geral", atletaA.nome(), atletaA.notaGeralMedia(), atletaB.nome(), atletaB.notaGeralMedia())
        );
    }

    private EstatisticaAccumulator accumulateEstatisticas(List<EstatisticaEntity> estatisticas) {
        if (estatisticas == null || estatisticas.isEmpty()) {
            return new EstatisticaAccumulator();
        }

        EstatisticaAccumulator accumulator = new EstatisticaAccumulator();
        EstatisticaEntity principal = estatisticas.stream()
                .max(Comparator.comparing(EstatisticaEntity::getJogos).thenComparing(EstatisticaEntity::getMinutos))
                .orElse(estatisticas.get(0));
        accumulator.clubeNome = principal.getClube().getNome();

        for (EstatisticaEntity estatistica : estatisticas) {
            accumulator.jogos += defaultShort(estatistica.getJogos());
            accumulator.minutos += defaultInteger(estatistica.getMinutos());
            accumulator.gols += defaultShort(estatistica.getGols());
            accumulator.assistencias += defaultShort(estatistica.getAssistencias());
            accumulator.chutesGol += defaultShort(estatistica.getChutesGol());
            accumulator.desarmes += defaultShort(estatistica.getDesarmes());
            accumulator.amarelos += defaultShort(estatistica.getAmarelos());
            accumulator.vermelhos += defaultShort(estatistica.getVermelhos());
        }
        return accumulator;
    }

    private RelatorioAccumulator accumulateRelatorios(List<RelatorioEntity> relatorios) {
        RelatorioAccumulator accumulator = new RelatorioAccumulator();
        if (relatorios == null || relatorios.isEmpty()) {
            return accumulator;
        }

        accumulator.tecnica = average(relatorios.stream().map(RelatorioEntity::getTecnica).toList());
        accumulator.tatica = average(relatorios.stream().map(RelatorioEntity::getTatica).toList());
        accumulator.fisico = average(relatorios.stream().map(RelatorioEntity::getFisico).toList());
        accumulator.mentalidade = average(relatorios.stream().map(RelatorioEntity::getMentalidade).toList());
        accumulator.potencial = average(relatorios.stream().map(RelatorioEntity::getPotencial).toList());
        accumulator.notaGeral = average(relatorios.stream().map(RelatorioEntity::getNotaGeral).toList());
        return accumulator;
    }

    private String resolvePosicaoPrincipal(Integer jogadorId) {
        return jogadorPosicaoRepository.findByJogadorIdOrderByOrdemAsc(jogadorId).stream()
                .findFirst()
                .map(JogadorPosicaoEntity::getPosicao)
                .map(posicao -> posicao.getNome())
                .orElse("Sem posicao");
    }

    private Integer calculateIdade(LocalDate dataNascimento) {
        if (dataNascimento == null) {
            return null;
        }
        return Period.between(dataNascimento, LocalDate.now()).getYears();
    }

    private BigDecimal average(List<BigDecimal> values) {
        if (values == null || values.isEmpty()) {
            return BigDecimal.ZERO.setScale(1, RoundingMode.HALF_UP);
        }
        BigDecimal total = values.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        return total.divide(BigDecimal.valueOf(values.size()), 1, RoundingMode.HALF_UP);
    }

    private int defaultShort(Short value) {
        return value == null ? 0 : value;
    }

    private int defaultInteger(Integer value) {
        return value == null ? 0 : value;
    }

    private static final class EstatisticaAccumulator {
        private String clubeNome;
        private int jogos;
        private int minutos;
        private int gols;
        private int assistencias;
        private int chutesGol;
        private int desarmes;
        private int amarelos;
        private int vermelhos;
    }

    private static final class RelatorioAccumulator {
        private BigDecimal tecnica = BigDecimal.ZERO.setScale(1, RoundingMode.HALF_UP);
        private BigDecimal tatica = BigDecimal.ZERO.setScale(1, RoundingMode.HALF_UP);
        private BigDecimal fisico = BigDecimal.ZERO.setScale(1, RoundingMode.HALF_UP);
        private BigDecimal mentalidade = BigDecimal.ZERO.setScale(1, RoundingMode.HALF_UP);
        private BigDecimal potencial = BigDecimal.ZERO.setScale(1, RoundingMode.HALF_UP);
        private BigDecimal notaGeral = BigDecimal.ZERO.setScale(1, RoundingMode.HALF_UP);
    }
}
