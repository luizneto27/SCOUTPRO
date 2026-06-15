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

    private ClubeEntity findClubeByCnpjOrThrow(String cnpj) {
        String normalized = CnpjUtils.normalize(cnpj);
        if (normalized == null || normalized.length() != 14) {
            throw new IllegalArgumentException("cnpj invalido");
        }
        return clubeRepository.findByCnpj(normalized)
                .orElseThrow(() -> new ResourceNotFoundException("clube nao encontrado"));
    }

    private ContratoResponse toResponse(ContratoEntity entity) {
        return new ContratoResponse(
                entity.getId(),
                entity.getJogador().getId(),
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
