package com.scoutpro.backend.application.clube;

import com.scoutpro.backend.application.common.ConflictException;
import com.scoutpro.backend.application.common.CnpjUtils;
import com.scoutpro.backend.application.common.ResourceNotFoundException;
import com.scoutpro.backend.infrastructure.persistence.entity.ClubeEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.JogadorEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.PaisEntity;
import com.scoutpro.backend.infrastructure.persistence.repository.ClubeRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.ContratoRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.PaisRepository;
import com.scoutpro.backend.infrastructure.web.clube.ClubeJogadorResponse;
import com.scoutpro.backend.infrastructure.web.clube.ClubeRequest;
import com.scoutpro.backend.infrastructure.web.clube.ClubeResponse;
import com.scoutpro.backend.infrastructure.web.jogador.PaisResumoResponse;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClubeService {

    private final ClubeRepository clubeRepository;
    private final PaisRepository paisRepository;
    private final ContratoRepository contratoRepository;

    public ClubeService(ClubeRepository clubeRepository, PaisRepository paisRepository, ContratoRepository contratoRepository) {
        this.clubeRepository = clubeRepository;
        this.paisRepository = paisRepository;
        this.contratoRepository = contratoRepository;
    }

    @Transactional
    public ClubeResponse create(ClubeRequest request) {
        String cnpj = normalizeCnpjOrFail(request.cnpj());
        if (clubeRepository.existsByNormalizedCnpj(cnpj)) {
            throw new ConflictException("cnpj ja cadastrado");
        }

        ClubeEntity entity = new ClubeEntity();
        applyFields(entity, request, cnpj);

        try {
            return toResponse(clubeRepository.saveAndFlush(entity));
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException("cnpj ja cadastrado");
        }
    }

    @Transactional(readOnly = true)
    public List<ClubeResponse> list() {
        return clubeRepository.findAllByOrderByNomeAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ClubeResponse getByCnpj(String cnpj) {
        return toResponse(findClubeByCnpjOrThrow(cnpj));
    }

    @Transactional
    public ClubeResponse update(String currentCnpj, ClubeRequest request) {
        ClubeEntity entity = findClubeByCnpjOrThrow(currentCnpj);
        String newCnpj = normalizeCnpjOrFail(request.cnpj());
        if (!CnpjUtils.normalize(entity.getCnpj()).equals(newCnpj)
                && clubeRepository.existsByNormalizedCnpjAndIdNot(newCnpj, entity.getId())) {
            throw new ConflictException("cnpj ja cadastrado");
        }

        applyFields(entity, request, newCnpj);

        try {
            return toResponse(clubeRepository.saveAndFlush(entity));
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException("cnpj ja cadastrado");
        }
    }

    @Transactional
    public void delete(String cnpj) {
        ClubeEntity entity = findClubeByCnpjOrThrow(cnpj);
        try {
            clubeRepository.delete(entity);
            clubeRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException("clube possui vinculos dependentes");
        }
    }

    @Transactional(readOnly = true)
    public List<ClubeJogadorResponse> listJogadores(String cnpj) {
        ClubeEntity clube = findClubeByCnpjOrThrow(cnpj);
        return contratoRepository.findJogadoresAtivosByClubeCnpj(clube.getCnpj()).stream()
                .map(this::toClubeJogadorResponse)
                .toList();
    }

    private void applyFields(ClubeEntity entity, ClubeRequest request, String normalizedCnpj) {
        entity.setCnpj(normalizedCnpj);
        entity.setNome(request.nome());
        entity.setPais(findPaisOrThrow(request.paisId()));
        entity.setCidade(request.cidade());
        entity.setFundacao(request.fundacao());
    }

    private ClubeEntity findClubeByCnpjOrThrow(String cnpj) {
        String normalizedCnpj = normalizeCnpjOrFail(cnpj);
        return clubeRepository.findByNormalizedCnpj(normalizedCnpj)
                .orElseThrow(() -> new ResourceNotFoundException("clube nao encontrado"));
    }

    private PaisEntity findPaisOrThrow(Integer paisId) {
        return paisRepository.findById(paisId)
                .orElseThrow(() -> new ResourceNotFoundException("pais nao encontrado"));
    }

    private ClubeResponse toResponse(ClubeEntity entity) {
        return new ClubeResponse(
                entity.getId(),
                CnpjUtils.format(entity.getCnpj()),
                entity.getNome(),
                toPaisResumoResponse(entity.getPais()),
                entity.getCidade(),
                entity.getFundacao()
        );
    }

    private ClubeJogadorResponse toClubeJogadorResponse(JogadorEntity jogador) {
        return new ClubeJogadorResponse(
                jogador.getId(),
                jogador.getNome(),
                jogador.getNomeCompleto(),
                toPaisResumoResponse(jogador.getPais()),
                jogador.getAtivo(),
                jogador.getTipoJogador()
        );
    }

    private PaisResumoResponse toPaisResumoResponse(PaisEntity pais) {
        if (pais == null) {
            return null;
        }
        return new PaisResumoResponse(pais.getId(), pais.getNome(), pais.getSigla());
    }

    private String normalizeCnpjOrFail(String cnpj) {
        String normalized = CnpjUtils.normalize(cnpj);
        if (normalized == null || normalized.length() != 14) {
            throw new IllegalArgumentException("cnpj invalido");
        }
        return normalized;
    }
}
