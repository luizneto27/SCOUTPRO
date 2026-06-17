package com.scoutpro.backend.application.jogador;

import com.scoutpro.backend.application.common.ResourceNotFoundException;
import com.scoutpro.backend.domain.enums.GravidadeLesao;
import com.scoutpro.backend.domain.enums.StatusRecuperacaoLesao;
import com.scoutpro.backend.infrastructure.persistence.entity.JogadorEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.LesaoEntity;
import com.scoutpro.backend.infrastructure.persistence.repository.JogadorRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.LesaoRepository;
import com.scoutpro.backend.infrastructure.web.jogador.LesaoRequest;
import com.scoutpro.backend.infrastructure.web.jogador.LesaoResponse;
import com.scoutpro.backend.infrastructure.web.jogador.LesaoResumoResponse;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LesaoService {

    private final LesaoRepository lesaoRepository;
    private final JogadorRepository jogadorRepository;

    public LesaoService(LesaoRepository lesaoRepository, JogadorRepository jogadorRepository) {
        this.lesaoRepository = lesaoRepository;
        this.jogadorRepository = jogadorRepository;
    }

    @Transactional
    public LesaoResponse create(LesaoRequest request) {
        LesaoEntity entity = new LesaoEntity();
        applyFields(entity, request);
        return toResponse(lesaoRepository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<LesaoResponse> list(Integer jogadorId, GravidadeLesao gravidade, StatusRecuperacaoLesao statusRecuperacao) {
        return lesaoRepository.findAll(buildSpecification(jogadorId, gravidade, statusRecuperacao), sort())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public LesaoResponse getById(Integer id) {
        return toResponse(findLesao(id));
    }

    @Transactional
    public LesaoResponse update(Integer id, LesaoRequest request) {
        LesaoEntity entity = findLesao(id);
        applyFields(entity, request);
        return toResponse(entity);
    }

    @Transactional
    public void delete(Integer id) {
        LesaoEntity entity = findLesao(id);
        lesaoRepository.delete(entity);
    }

    @Transactional(readOnly = true)
    public LesaoResumoResponse getResumo(Integer jogadorId) {
        List<LesaoEntity> lesoes = lesaoRepository.findAll(buildSpecification(jogadorId, null, null));
        LocalDate hoje = LocalDate.now();
        LocalDate limiteRetorno = hoje.plusDays(7);
        YearMonth mesAtual = YearMonth.from(hoje);

        long noDepartamentoMedico = lesoes.stream()
                .filter(lesao -> isIndisponivelHoje(lesao, hoje))
                .count();

        long retornoPrevistoProximos7Dias = lesoes.stream()
                .filter(lesao -> isIndisponivelHoje(lesao, hoje))
                .map(this::calcularDataPrevistaRetorno)
                .filter(data -> data != null && !data.isBefore(hoje) && !data.isAfter(limiteRetorno))
                .count();

        long recuperados = lesoes.stream()
                .filter(lesao -> isRecuperada(lesao, hoje))
                .count();

        long recuperadosNoMes = lesoes.stream()
                .filter(lesao -> isRecuperada(lesao, hoje))
                .map(this::calcularDataPrevistaRetorno)
                .filter(data -> data != null && !data.isAfter(hoje) && YearMonth.from(data).equals(mesAtual))
                .count();

        return new LesaoResumoResponse(
                lesoes.size(),
                noDepartamentoMedico,
                retornoPrevistoProximos7Dias,
                recuperados,
                recuperadosNoMes
        );
    }

    private boolean isIndisponivelHoje(LesaoEntity lesao, LocalDate hoje) {
        if (lesao.getStatusRecuperacao() == StatusRecuperacaoLesao.RECUPERADO) {
            return false;
        }

        if (lesao.getStatusRecuperacao() == StatusRecuperacaoLesao.EM_RECUPERACAO
                || lesao.getStatusRecuperacao() == StatusRecuperacaoLesao.RECAIDA) {
            return true;
        }

        LocalDate retornoPrevisto = calcularDataPrevistaRetorno(lesao);
        return retornoPrevisto == null || !retornoPrevisto.isBefore(hoje);
    }

    private boolean isRecuperada(LesaoEntity lesao, LocalDate hoje) {
        if (lesao.getStatusRecuperacao() == StatusRecuperacaoLesao.RECUPERADO) {
            return true;
        }

        if (lesao.getStatusRecuperacao() == StatusRecuperacaoLesao.EM_RECUPERACAO
                || lesao.getStatusRecuperacao() == StatusRecuperacaoLesao.RECAIDA) {
            return false;
        }

        LocalDate retornoPrevisto = calcularDataPrevistaRetorno(lesao);
        return retornoPrevisto != null && retornoPrevisto.isBefore(hoje);
    }

    private Specification<LesaoEntity> buildSpecification(Integer jogadorId, GravidadeLesao gravidade, StatusRecuperacaoLesao statusRecuperacao) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (jogadorId != null) {
                predicates.add(criteriaBuilder.equal(root.get("jogador").get("id"), jogadorId));
            }
            if (gravidade != null) {
                predicates.add(criteriaBuilder.equal(root.get("gravidade"), gravidade));
            }
            if (statusRecuperacao != null) {
                predicates.add(criteriaBuilder.equal(root.get("statusRecuperacao"), statusRecuperacao));
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private Sort sort() {
        return Sort.by(Sort.Order.desc("dataLesao"), Sort.Order.desc("id"));
    }

    private void applyFields(LesaoEntity entity, LesaoRequest request) {
        entity.setJogador(findJogador(request.jogadorId()));
        entity.setDataLesao(request.dataLesao());
        entity.setTipoLesao(request.tipoLesao());
        entity.setGravidade(request.gravidade());
        entity.setStatusRecuperacao(request.statusRecuperacao());
        entity.setTempoRecuperacao(request.tempoRecuperacao());
    }

    private JogadorEntity findJogador(Integer jogadorId) {
        return jogadorRepository.findById(jogadorId)
                .orElseThrow(() -> new ResourceNotFoundException("jogador nao encontrado"));
    }

    private LesaoEntity findLesao(Integer id) {
        return lesaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("lesao nao encontrada"));
    }

    private LesaoResponse toResponse(LesaoEntity entity) {
        return new LesaoResponse(
                entity.getId(),
                entity.getJogador().getId(),
                entity.getJogador().getNome(),
                entity.getDataLesao(),
                entity.getTipoLesao(),
                entity.getGravidade(),
                entity.getStatusRecuperacao(),
                entity.getTempoRecuperacao(),
                calcularDataPrevistaRetorno(entity)
        );
    }

    private LocalDate calcularDataPrevistaRetorno(LesaoEntity entity) {
        if (entity.getDataLesao() == null || entity.getTempoRecuperacao() == null) {
            return null;
        }
        return entity.getDataLesao().plusDays(entity.getTempoRecuperacao());
    }
}
