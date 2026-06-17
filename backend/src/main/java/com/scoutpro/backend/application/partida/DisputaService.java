package com.scoutpro.backend.application.partida;

import com.scoutpro.backend.application.common.ConflictException;
import com.scoutpro.backend.application.common.ResourceNotFoundException;
import com.scoutpro.backend.infrastructure.persistence.entity.DisputaEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.DisputaId;
import com.scoutpro.backend.infrastructure.persistence.entity.JogadorEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.PartidaEntity;
import com.scoutpro.backend.infrastructure.persistence.repository.ContratoRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.DisputaRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.JogadorRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.PartidaRepository;
import com.scoutpro.backend.infrastructure.web.partida.DisputaRequest;
import com.scoutpro.backend.infrastructure.web.partida.DisputaResponse;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DisputaService {

    private final DisputaRepository disputaRepository;
    private final JogadorRepository jogadorRepository;
    private final PartidaRepository partidaRepository;
    private final ContratoRepository contratoRepository;

    public DisputaService(
            DisputaRepository disputaRepository,
            JogadorRepository jogadorRepository,
            PartidaRepository partidaRepository,
            ContratoRepository contratoRepository
    ) {
        this.disputaRepository = disputaRepository;
        this.jogadorRepository = jogadorRepository;
        this.partidaRepository = partidaRepository;
        this.contratoRepository = contratoRepository;
    }

    @Transactional(readOnly = true)
    public List<DisputaResponse> listByPartida(Integer partidaId) {
        ensurePartidaExists(partidaId);
        return disputaRepository.findAllByPartidaIdOrderByJogadorNomeAsc(partidaId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public DisputaResponse create(Integer partidaId, DisputaRequest request) {
        PartidaEntity partida = findPartida(partidaId);
        JogadorEntity jogador = findJogador(request.jogadorId());
        DisputaId id = new DisputaId(jogador.getId(), partida.getId());

        if (disputaRepository.existsById(id)) {
            throw new ConflictException("disputa ja cadastrada para o jogador nesta partida");
        }

        validateContrato(jogador.getId(), partida);

        DisputaEntity entity = new DisputaEntity();
        entity.setId(id);
        entity.setJogador(jogador);
        entity.setPartida(partida);
        applyFields(entity, request);

        return toResponse(disputaRepository.saveAndFlush(entity));
    }

    @Transactional
    public DisputaResponse update(Integer partidaId, Integer jogadorId, DisputaRequest request) {
        if (!jogadorId.equals(request.jogadorId())) {
            throw new IllegalArgumentException("jogadorId do payload deve ser igual ao da URL");
        }

        DisputaEntity entity = disputaRepository.findById(new DisputaId(jogadorId, partidaId))
                .orElseThrow(() -> new ResourceNotFoundException("disputa nao encontrada"));

        validateContrato(jogadorId, entity.getPartida());
        applyFields(entity, request);

        return toResponse(disputaRepository.saveAndFlush(entity));
    }

    @Transactional
    public void delete(Integer partidaId, Integer jogadorId) {
        DisputaEntity entity = disputaRepository.findById(new DisputaId(jogadorId, partidaId))
                .orElseThrow(() -> new ResourceNotFoundException("disputa nao encontrada"));
        disputaRepository.delete(entity);
        disputaRepository.flush();
    }

    private void ensurePartidaExists(Integer partidaId) {
        if (!partidaRepository.existsById(partidaId)) {
            throw new ResourceNotFoundException("partida nao encontrada");
        }
    }

    private PartidaEntity findPartida(Integer partidaId) {
        return partidaRepository.findById(partidaId)
                .orElseThrow(() -> new ResourceNotFoundException("partida nao encontrada"));
    }

    private JogadorEntity findJogador(Integer jogadorId) {
        return jogadorRepository.findById(jogadorId)
                .orElseThrow(() -> new ResourceNotFoundException("jogador nao encontrado"));
    }

    private void validateContrato(Integer jogadorId, PartidaEntity partida) {
        boolean possuiContratoValido = !contratoRepository
                .findContratosValidosByJogadorIdAndDataReferencia(jogadorId, partida.getData())
                .isEmpty();

        if (!possuiContratoValido) {
            throw new ConflictException("jogador nao possui contrato valido para a data da partida");
        }
    }

    private void applyFields(DisputaEntity entity, DisputaRequest request) {
        entity.setGolsPartida(defaultInteger(request.golsPartida()));
        entity.setFinalizacoesGolPartida(defaultInteger(request.finalizacoesGolPartida()));
        entity.setFaltasCometidasPartida(defaultInteger(request.faltasCometidasPartida()));
        entity.setFaltasSofridasPartida(defaultInteger(request.faltasSofridasPartida()));
        entity.setCartoesAmarelosPartida(defaultInteger(request.cartoesAmarelosPartida()));
        entity.setCartoesVermelhosPartida(defaultInteger(request.cartoesVermelhosPartida()));
        entity.setImpedimentosPartida(defaultInteger(request.impedimentosPartida()));
        entity.setKmPercorridosPartida(request.kmPercorridosPartida() == null ? BigDecimal.ZERO : request.kmPercorridosPartida());
        entity.setDesarmesPartida(defaultInteger(request.desarmesPartida()));
        entity.setPassesChavePartida(defaultInteger(request.passesChavePartida()));
        entity.setMinutosJogadosPartida(defaultInteger(request.minutosJogadosPartida()));
        entity.setNotaPartida(request.notaPartida());
        entity.setReposicoesPartida(defaultInteger(request.reposicoesPartida()));
        entity.setGolsSofridosPartida(defaultInteger(request.golsSofridosPartida()));
        entity.setPenaltisDefendidosPartida(defaultInteger(request.penaltisDefendidosPartida()));
        entity.setDefesasDificeisPartida(defaultInteger(request.defesasDificeisPartida()));
        entity.setCleanSheetPartida(Boolean.TRUE.equals(request.cleanSheetPartida()));
    }

    private DisputaResponse toResponse(DisputaEntity entity) {
        return new DisputaResponse(
                entity.getJogador().getId(),
                entity.getJogador().getNome(),
                entity.getPartida().getId(),
                entity.getGolsPartida(),
                entity.getFinalizacoesGolPartida(),
                entity.getFaltasCometidasPartida(),
                entity.getFaltasSofridasPartida(),
                entity.getCartoesAmarelosPartida(),
                entity.getCartoesVermelhosPartida(),
                entity.getImpedimentosPartida(),
                entity.getKmPercorridosPartida(),
                entity.getDesarmesPartida(),
                entity.getPassesChavePartida(),
                entity.getMinutosJogadosPartida(),
                entity.getNotaPartida(),
                entity.getReposicoesPartida(),
                entity.getGolsSofridosPartida(),
                entity.getPenaltisDefendidosPartida(),
                entity.getDefesasDificeisPartida(),
                entity.getCleanSheetPartida()
        );
    }

    private Integer defaultInteger(Integer value) {
        return value == null ? 0 : value;
    }
}
