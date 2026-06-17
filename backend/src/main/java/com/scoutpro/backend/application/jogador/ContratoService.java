package com.scoutpro.backend.application.jogador;

import com.scoutpro.backend.application.common.ConflictException;
import com.scoutpro.backend.application.common.CnpjUtils;
import com.scoutpro.backend.application.common.ResourceNotFoundException;
import com.scoutpro.backend.infrastructure.persistence.entity.ClubeEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.ContratoEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.JogadorEntity;
import com.scoutpro.backend.infrastructure.persistence.repository.ClubeRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.ContratoRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.JogadorRepository;
import com.scoutpro.backend.infrastructure.web.jogador.ContratoRequest;
import com.scoutpro.backend.infrastructure.web.jogador.ContratoResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ContratoService {

    private final JogadorRepository jogadorRepository;
    private final ClubeRepository clubeRepository;
    private final ContratoRepository contratoRepository;

    public ContratoService(JogadorRepository jogadorRepository, ClubeRepository clubeRepository, ContratoRepository contratoRepository) {
        this.jogadorRepository = jogadorRepository;
        this.clubeRepository = clubeRepository;
        this.contratoRepository = contratoRepository;
    }

    @Transactional
    public ContratoResponse create(Integer jogadorId, ContratoRequest request) {
        JogadorEntity jogador = jogadorRepository.findById(jogadorId)
                .orElseThrow(() -> new ResourceNotFoundException("jogador nao encontrado"));
        ClubeEntity clube = findClubeByCnpjOrThrow(request.cnpjClube());

        contratoRepository.findByJogadorIdAndAtivoTrue(jogadorId).ifPresent(contratoAtual -> {
            if (request.dataInicio().isBefore(contratoAtual.getDataInicio())) {
                throw new IllegalArgumentException("data_inicio do novo contrato nao pode ser anterior ao contrato ativo");
            }
            contratoAtual.setAtivo(false);
            contratoAtual.setDataFim(request.dataInicio());
            contratoRepository.saveAndFlush(contratoAtual);
        });

        ContratoEntity entity = new ContratoEntity();
        entity.setJogador(jogador);
        entity.setClube(clube);
        entity.setValorContrato(request.valorContrato());
        entity.setTempoContrato(request.tempoContrato());
        entity.setMultaRescisoria(request.multaRescisoria());
        entity.setDataInicio(request.dataInicio());
        entity.setDataFim(null);
        entity.setAtivo(true);

        try {
            return toResponse(contratoRepository.saveAndFlush(entity));
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException("jogador ja possui contrato ativo");
        }
    }

    @Transactional(readOnly = true)
    public java.util.List<ContratoResponse> listByJogador(Integer jogadorId) {
        ensureJogadorExists(jogadorId);
        return contratoRepository.findAllByJogadorIdOrderByDataInicioDescIdDesc(jogadorId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public java.util.List<ContratoResponse> listByClube(String cnpj) {
        ClubeEntity clube = findClubeByCnpjOrThrow(cnpj);
        return contratoRepository.findAllByClubeCnpjOrderByAtivoDescDataInicioDesc(clube.getCnpj()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ContratoResponse update(Integer contratoId, ContratoRequest request) {
        ContratoEntity entity = contratoRepository.findById(contratoId)
                .orElseThrow(() -> new ResourceNotFoundException("contrato nao encontrado"));
        ClubeEntity clube = findClubeByCnpjOrThrow(request.cnpjClube());

        if (!clube.getId().equals(entity.getClube().getId()) && Boolean.TRUE.equals(entity.getAtivo())) {
            throw new ConflictException("nao e permitido trocar o clube de um contrato ativo via update");
        }

        entity.setClube(clube);
        entity.setValorContrato(request.valorContrato());
        entity.setTempoContrato(request.tempoContrato());
        entity.setMultaRescisoria(request.multaRescisoria());
        entity.setDataInicio(request.dataInicio());

        return toResponse(contratoRepository.saveAndFlush(entity));
    }

    @Transactional
    public void delete(Integer contratoId) {
        ContratoEntity entity = contratoRepository.findById(contratoId)
                .orElseThrow(() -> new ResourceNotFoundException("contrato nao encontrado"));
        contratoRepository.delete(entity);
        contratoRepository.flush();
    }

    @Transactional
    public ContratoResponse encerrar(Integer contratoId, java.time.LocalDate dataFim) {
        ContratoEntity entity = contratoRepository.findById(contratoId)
                .orElseThrow(() -> new ResourceNotFoundException("contrato nao encontrado"));
        if (dataFim != null && dataFim.isBefore(entity.getDataInicio())) {
            throw new IllegalArgumentException("data_fim nao pode ser anterior a data_inicio");
        }
        entity.setDataFim(dataFim);
        entity.setAtivo(false);
        return toResponse(contratoRepository.saveAndFlush(entity));
    }

    private ClubeEntity findClubeByCnpjOrThrow(String cnpj) {
        String normalized = CnpjUtils.normalize(cnpj);
        if (normalized == null || normalized.length() != 14) {
            throw new IllegalArgumentException("cnpj invalido");
        }
        return clubeRepository.findByNormalizedCnpj(normalized)
                .orElseThrow(() -> new ResourceNotFoundException("clube nao encontrado"));
    }

    private void ensureJogadorExists(Integer jogadorId) {
        if (!jogadorRepository.existsById(jogadorId)) {
            throw new ResourceNotFoundException("jogador nao encontrado");
        }
    }

    private ContratoResponse toResponse(ContratoEntity entity) {
        return new ContratoResponse(
                entity.getId(),
                entity.getJogador().getId(),
                entity.getJogador().getNome(),
                entity.getClube().getId(),
                entity.getClube().getNome(),
                CnpjUtils.format(entity.getClube().getCnpj()),
                entity.getValorContrato(),
                entity.getTempoContrato(),
                entity.getMultaRescisoria(),
                entity.getDataInicio(),
                entity.getDataFim(),
                entity.getAtivo()
        );
    }
}
