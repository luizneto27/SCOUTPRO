package com.scoutpro.backend.application.jogador;

import com.scoutpro.backend.application.common.ConflictException;
import com.scoutpro.backend.application.common.CnpjUtils;
import com.scoutpro.backend.application.common.ResourceNotFoundException;
import com.scoutpro.backend.infrastructure.persistence.entity.ClubeEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.ContratoEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.JogadorEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.TransferenciaEntity;
import com.scoutpro.backend.infrastructure.persistence.repository.ClubeRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.ContratoRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.JogadorRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.TransferenciaRepository;
import com.scoutpro.backend.infrastructure.web.jogador.TransferenciaRequest;
import com.scoutpro.backend.infrastructure.web.jogador.TransferenciaResponse;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TransferenciaService {

    private final JogadorRepository jogadorRepository;
    private final ClubeRepository clubeRepository;
    private final ContratoRepository contratoRepository;
    private final TransferenciaRepository transferenciaRepository;

    public TransferenciaService(
            JogadorRepository jogadorRepository,
            ClubeRepository clubeRepository,
            ContratoRepository contratoRepository,
            TransferenciaRepository transferenciaRepository
    ) {
        this.jogadorRepository = jogadorRepository;
        this.clubeRepository = clubeRepository;
        this.contratoRepository = contratoRepository;
        this.transferenciaRepository = transferenciaRepository;
    }

    @Transactional
    public TransferenciaResponse create(Integer jogadorId, TransferenciaRequest request) {
        JogadorEntity jogador = jogadorRepository.findById(jogadorId)
                .orElseThrow(() -> new ResourceNotFoundException("jogador nao encontrado"));
        ClubeEntity clubeOrigem = findClubeByCnpjOrThrow(request.cnpjClubeOrigem());
        ClubeEntity clubeDestino = findClubeByCnpjOrThrow(request.cnpjClubeDestino());

        if (clubeOrigem.getId().equals(clubeDestino.getId())) {
            throw new IllegalArgumentException("clube de origem e destino devem ser distintos");
        }

        ContratoEntity contratoAtual = contratoRepository.findByJogadorIdAndAtivoTrue(jogadorId)
                .orElseThrow(() -> new ConflictException("jogador nao possui contrato ativo para transferencia"));

        if (!contratoAtual.getClube().getId().equals(clubeOrigem.getId())) {
            throw new ConflictException("clube de origem nao corresponde ao contrato ativo do jogador");
        }

        LocalDate dataTransferencia = request.dataTransferencia();
        if (dataTransferencia.isBefore(contratoAtual.getDataInicio())) {
            throw new IllegalArgumentException("data_transferencia nao pode ser anterior ao inicio do contrato ativo");
        }

        contratoAtual.setAtivo(false);
        contratoAtual.setDataFim(dataTransferencia);
        contratoRepository.saveAndFlush(contratoAtual);

        TransferenciaEntity transferencia = new TransferenciaEntity();
        transferencia.setJogador(jogador);
        transferencia.setClubeOrigem(clubeOrigem);
        transferencia.setClubeDestino(clubeDestino);
        transferencia.setDataTransferencia(dataTransferencia);
        transferencia.setValorPago(request.valorPago());
        transferencia.setTipo(request.tipo());
        TransferenciaEntity saved = transferenciaRepository.saveAndFlush(transferencia);

        ContratoEntity novoContrato = new ContratoEntity();
        novoContrato.setJogador(jogador);
        novoContrato.setClube(clubeDestino);
        novoContrato.setValorContrato(request.valorContratoDestino());
        novoContrato.setTempoContrato(request.tempoContratoDestino());
        novoContrato.setMultaRescisoria(request.multaRescisoriaDestino());
        novoContrato.setDataInicio(dataTransferencia);
        novoContrato.setDataFim(null);
        novoContrato.setAtivo(true);
        contratoRepository.saveAndFlush(novoContrato);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TransferenciaResponse> listByJogador(Integer jogadorId) {
        if (!jogadorRepository.existsById(jogadorId)) {
            throw new ResourceNotFoundException("jogador nao encontrado");
        }
        return transferenciaRepository.findAllByJogadorIdOrderByDataTransferenciaDescIdDesc(jogadorId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TransferenciaResponse> listByClube(String cnpj) {
        ClubeEntity clube = findClubeByCnpjOrThrow(cnpj);
        return transferenciaRepository.findAllByClubeCnpjOrderByDataTransferenciaDescIdDesc(clube.getCnpj()).stream()
                .map(this::toResponse)
                .toList();
    }

    private ClubeEntity findClubeByCnpjOrThrow(String cnpj) {
        String normalized = CnpjUtils.normalize(cnpj);
        if (normalized == null || normalized.length() != 14) {
            throw new IllegalArgumentException("cnpj invalido");
        }
        return clubeRepository.findByNormalizedCnpj(normalized)
                .orElseThrow(() -> new ResourceNotFoundException("clube nao encontrado"));
    }

    private TransferenciaResponse toResponse(TransferenciaEntity entity) {
        return new TransferenciaResponse(
                entity.getId(),
                entity.getJogador().getId(),
                entity.getJogador().getNome(),
                entity.getDataTransferencia(),
                entity.getValorPago(),
                entity.getTipo(),
                entity.getClubeOrigem().getId(),
                entity.getClubeOrigem().getNome(),
                CnpjUtils.format(entity.getClubeOrigem().getCnpj()),
                entity.getClubeDestino().getId(),
                entity.getClubeDestino().getNome(),
                CnpjUtils.format(entity.getClubeDestino().getCnpj())
        );
    }
}
