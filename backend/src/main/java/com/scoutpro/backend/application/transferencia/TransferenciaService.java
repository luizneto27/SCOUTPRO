package com.scoutpro.backend.application.transferencia;

import com.scoutpro.backend.domain.enums.TipoTransferencia;
import com.scoutpro.backend.infrastructure.persistence.entity.ClubeEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.JogadorEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.TransferenciaEntity;
import com.scoutpro.backend.infrastructure.persistence.repository.ClubeRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.JogadorRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.TransferenciaRepository;
import com.scoutpro.backend.infrastructure.web.transferencias.dto.TransferenciaRequest;
import com.scoutpro.backend.infrastructure.web.transferencias.dto.TransferenciaResponse;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class TransferenciaService {

    private final TransferenciaRepository transferenciaRepository;
    private final JogadorRepository jogadorRepository;
    private final ClubeRepository clubeRepository;

    @Transactional
    public TransferenciaResponse create(TransferenciaRequest req) {
        if (req.getClubeOrigemId().equals(req.getClubeDestinoId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "clubeOrigemId cannot be equal to clubeDestinoId");
        }

        JogadorEntity jogador = jogadorRepository.findById(req.getIdJogador()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Jogador not found"));
        ClubeEntity origem = clubeRepository.findById(req.getClubeOrigemId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Clube origem not found"));
        ClubeEntity destino = clubeRepository.findById(req.getClubeDestinoId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Clube destino not found"));

        TransferenciaEntity t = new TransferenciaEntity();
        t.setDataTransferencia(LocalDate.now());
        t.setTipo(req.getTipo());
        t.setJogador(jogador);
        t.setClubeOrigem(origem);
        t.setClubeDestino(destino);
        t.setValorPago(req.getValor());

        TransferenciaEntity saved = transferenciaRepository.save(t);

        return new TransferenciaResponse(saved.getId(), saved.getDataTransferencia(), saved.getValorPago(), saved.getTipo(), saved.getJogador().getId(), saved.getClubeOrigem().getId(), saved.getClubeDestino().getId());
    }

        @org.springframework.transaction.annotation.Transactional(readOnly = true)
        public java.util.List<com.scoutpro.backend.infrastructure.web.transferencias.dto.TransferenciaResponse> listByJogador(Integer jogadorId) {
        return transferenciaRepository.findByJogadorIdOrderByDataTransferenciaDesc(jogadorId).stream()
            .map(t -> new com.scoutpro.backend.infrastructure.web.transferencias.dto.TransferenciaResponse(
                t.getId(),
                t.getDataTransferencia(),
                t.getValorPago(),
                t.getTipo(),
                t.getJogador() != null ? t.getJogador().getId() : null,
                t.getClubeOrigem() != null ? t.getClubeOrigem().getId() : null,
                t.getClubeDestino() != null ? t.getClubeDestino().getId() : null
            ))
            .toList();
        }

}
