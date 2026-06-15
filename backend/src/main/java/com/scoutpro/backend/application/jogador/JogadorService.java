package com.scoutpro.backend.application.jogador;

import com.scoutpro.backend.application.common.ConflictException;
import com.scoutpro.backend.application.common.ResourceNotFoundException;
import com.scoutpro.backend.domain.enums.TipoJogador;
import com.scoutpro.backend.infrastructure.persistence.entity.EmpresarioEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.GoleiroEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.JogadorEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.JogadorLinhaEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.JogadorPosicaoEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.PaisEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.PosicaoEntity;
import com.scoutpro.backend.infrastructure.persistence.repository.EmpresarioRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.GoleiroRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.JogadorLinhaRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.JogadorPosicaoRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.JogadorRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.PaisRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.PosicaoRepository;
import com.scoutpro.backend.infrastructure.web.jogador.CreateJogadorRequest;
import com.scoutpro.backend.infrastructure.web.jogador.EmpresarioResumoResponse;
import com.scoutpro.backend.infrastructure.web.jogador.GoleiroRequest;
import com.scoutpro.backend.infrastructure.web.jogador.GoleiroResponse;
import com.scoutpro.backend.infrastructure.web.jogador.JogadorLinhaRequest;
import com.scoutpro.backend.infrastructure.web.jogador.JogadorLinhaResponse;
import com.scoutpro.backend.infrastructure.web.jogador.JogadorPosicaoRequest;
import com.scoutpro.backend.infrastructure.web.jogador.JogadorPosicaoResponse;
import com.scoutpro.backend.infrastructure.web.jogador.JogadorResponse;
import com.scoutpro.backend.infrastructure.web.jogador.PaisResumoResponse;
import com.scoutpro.backend.infrastructure.web.jogador.UpdateJogadorRequest;
import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class JogadorService {

    private final JogadorRepository jogadorRepository;
    private final PaisRepository paisRepository;
    private final EmpresarioRepository empresarioRepository;
    private final PosicaoRepository posicaoRepository;
    private final JogadorPosicaoRepository jogadorPosicaoRepository;
    private final JogadorLinhaRepository jogadorLinhaRepository;
    private final GoleiroRepository goleiroRepository;

    public JogadorService(
            JogadorRepository jogadorRepository,
            PaisRepository paisRepository,
            EmpresarioRepository empresarioRepository,
            PosicaoRepository posicaoRepository,
            JogadorPosicaoRepository jogadorPosicaoRepository,
            JogadorLinhaRepository jogadorLinhaRepository,
            GoleiroRepository goleiroRepository
    ) {
        this.jogadorRepository = jogadorRepository;
        this.paisRepository = paisRepository;
        this.empresarioRepository = empresarioRepository;
        this.posicaoRepository = posicaoRepository;
        this.jogadorPosicaoRepository = jogadorPosicaoRepository;
        this.jogadorLinhaRepository = jogadorLinhaRepository;
        this.goleiroRepository = goleiroRepository;
    }

    @Transactional
    public JogadorResponse create(CreateJogadorRequest request) {
        JogadorEntity jogador = new JogadorEntity();
        applyCreateFields(jogador, request);

        JogadorEntity saved = jogadorRepository.save(jogador);
        replacePosicoes(saved, request.posicoes());

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<JogadorResponse> list(String nome, Boolean ativo, TipoJogador tipoJogador, Integer paisId, Pageable pageable) {
        return jogadorRepository.findAll(buildSpecification(nome, ativo, tipoJogador, paisId), pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public JogadorResponse getById(Integer id) {
        return toResponse(findJogador(id));
    }

    @Transactional
    public JogadorResponse update(Integer id, UpdateJogadorRequest request) {
        JogadorEntity jogador = findJogador(id);
        validateTipoJogadorChange(jogador.getId(), request.tipoJogador());

        applyUpdateFields(jogador, request);
        replacePosicoes(jogador, request.posicoes());

        return toResponse(jogador);
    }

    @Transactional
    public void delete(Integer id) {
        JogadorEntity jogador = findJogador(id);
        jogador.setAtivo(false);
    }

    @Transactional
    public JogadorLinhaResponse createJogadorLinha(Integer jogadorId, JogadorLinhaRequest request) {
        JogadorEntity jogador = findJogador(jogadorId);
        validateJogadorLinhaCanBeCreated(jogador);

        JogadorLinhaEntity entity = new JogadorLinhaEntity();
        entity.setJogador(jogador);
        applyJogadorLinhaFields(entity, request);

        return toJogadorLinhaResponse(jogadorLinhaRepository.save(entity));
    }

    @Transactional
    public JogadorLinhaResponse updateJogadorLinha(Integer jogadorId, JogadorLinhaRequest request) {
        JogadorLinhaEntity entity = jogadorLinhaRepository.findById(jogadorId)
                .orElseThrow(() -> new ResourceNotFoundException("detalhe de jogador de linha nao encontrado"));

        applyJogadorLinhaFields(entity, request);

        return toJogadorLinhaResponse(entity);
    }

    @Transactional
    public GoleiroResponse createGoleiro(Integer jogadorId, GoleiroRequest request) {
        JogadorEntity jogador = findJogador(jogadorId);
        validateGoleiroCanBeCreated(jogador);

        GoleiroEntity entity = new GoleiroEntity();
        entity.setJogador(jogador);
        applyGoleiroFields(entity, request);

        return toGoleiroResponse(goleiroRepository.save(entity));
    }

    @Transactional
    public GoleiroResponse updateGoleiro(Integer jogadorId, GoleiroRequest request) {
        GoleiroEntity entity = goleiroRepository.findById(jogadorId)
                .orElseThrow(() -> new ResourceNotFoundException("detalhe de goleiro nao encontrado"));

        applyGoleiroFields(entity, request);

        return toGoleiroResponse(entity);
    }

    private Specification<JogadorEntity> buildSpecification(String nome, Boolean ativo, TipoJogador tipoJogador, Integer paisId) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (nome != null && !nome.isBlank()) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("nome")), "%" + nome.toLowerCase() + "%"));
            }
            if (ativo != null) {
                predicates.add(criteriaBuilder.equal(root.get("ativo"), ativo));
            }
            if (tipoJogador != null) {
                predicates.add(criteriaBuilder.equal(root.get("tipoJogador"), tipoJogador));
            }
            if (paisId != null) {
                predicates.add(criteriaBuilder.equal(root.get("pais").get("id"), paisId));
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private void applyCreateFields(JogadorEntity jogador, CreateJogadorRequest request) {
        jogador.setNome(request.nome());
        jogador.setNomeCompleto(request.nomeCompleto());
        jogador.setPerfilTexto(request.perfilTexto());
        jogador.setDataNascimento(request.dataNascimento());
        jogador.setPais(findPaisOrNull(request.paisId()));
        jogador.setValorMercado(request.valorMercado());
        jogador.setTitulos(defaultInteger(request.titulos()));
        jogador.setAlturaCm(request.alturaCm());
        jogador.setPesoKg(request.pesoKg());
        jogador.setPeDominante(request.peDominante());
        jogador.setEmpresario(findEmpresarioOrNull(request.empresarioId()));
        jogador.setAtivo(request.ativo() == null || request.ativo());
        jogador.setTipoJogador(request.tipoJogador());
    }

    private void applyUpdateFields(JogadorEntity jogador, UpdateJogadorRequest request) {
        jogador.setNome(request.nome());
        jogador.setNomeCompleto(request.nomeCompleto());
        jogador.setPerfilTexto(request.perfilTexto());
        jogador.setDataNascimento(request.dataNascimento());
        jogador.setPais(findPaisOrNull(request.paisId()));
        jogador.setValorMercado(request.valorMercado());
        jogador.setTitulos(defaultInteger(request.titulos()));
        jogador.setAlturaCm(request.alturaCm());
        jogador.setPesoKg(request.pesoKg());
        jogador.setPeDominante(request.peDominante());
        jogador.setEmpresario(findEmpresarioOrNull(request.empresarioId()));
        jogador.setAtivo(request.ativo());
        jogador.setTipoJogador(request.tipoJogador());
    }

    private void replacePosicoes(JogadorEntity jogador, List<JogadorPosicaoRequest> posicoes) {
        validatePosicoes(posicoes);

        jogadorPosicaoRepository.deleteByJogadorId(jogador.getId());
        jogadorPosicaoRepository.flush();

        if (posicoes == null || posicoes.isEmpty()) {
            return;
        }

        List<JogadorPosicaoEntity> entities = new ArrayList<>();
        for (JogadorPosicaoRequest request : posicoes) {
            PosicaoEntity posicao = posicaoRepository.findById(request.posicaoId())
                    .orElseThrow(() -> new ResourceNotFoundException("posicao nao encontrada: " + request.posicaoId()));

            JogadorPosicaoEntity entity = new JogadorPosicaoEntity();
            entity.setJogador(jogador);
            entity.setPosicao(posicao);
            entity.setOrdem(request.ordem());
            entities.add(entity);
        }

        jogadorPosicaoRepository.saveAll(entities);
    }

    private void validatePosicoes(List<JogadorPosicaoRequest> posicoes) {
        if (posicoes == null || posicoes.isEmpty()) {
            return;
        }

        Set<Integer> posicaoIds = new HashSet<>();
        Set<Short> ordens = new HashSet<>();
        for (JogadorPosicaoRequest request : posicoes) {
            if (!posicaoIds.add(request.posicaoId())) {
                throw new IllegalArgumentException("posicao duplicada no payload");
            }
            if (!ordens.add(request.ordem())) {
                throw new IllegalArgumentException("ordem de posicao duplicada no payload");
            }
        }
    }

    private void validateTipoJogadorChange(Integer jogadorId, TipoJogador tipoJogador) {
        if (tipoJogador == TipoJogador.GOLEIRO && jogadorLinhaRepository.existsById(jogadorId)) {
            throw new ConflictException("jogador possui detalhe de jogador de linha");
        }
        if (tipoJogador == TipoJogador.JOGADOR_LINHA && goleiroRepository.existsById(jogadorId)) {
            throw new ConflictException("jogador possui detalhe de goleiro");
        }
    }

    private void validateJogadorLinhaCanBeCreated(JogadorEntity jogador) {
        if (jogador.getTipoJogador() != TipoJogador.JOGADOR_LINHA) {
            throw new ConflictException("tipo_jogador deve ser JOGADOR_LINHA");
        }
        if (jogadorLinhaRepository.existsById(jogador.getId())) {
            throw new ConflictException("detalhe de jogador de linha ja existe");
        }
        if (goleiroRepository.existsById(jogador.getId())) {
            throw new ConflictException("jogador ja possui detalhe de goleiro");
        }
    }

    private void validateGoleiroCanBeCreated(JogadorEntity jogador) {
        if (jogador.getTipoJogador() != TipoJogador.GOLEIRO) {
            throw new ConflictException("tipo_jogador deve ser GOLEIRO");
        }
        if (goleiroRepository.existsById(jogador.getId())) {
            throw new ConflictException("detalhe de goleiro ja existe");
        }
        if (jogadorLinhaRepository.existsById(jogador.getId())) {
            throw new ConflictException("jogador ja possui detalhe de jogador de linha");
        }
    }

    private void applyJogadorLinhaFields(JogadorLinhaEntity entity, JogadorLinhaRequest request) {
        entity.setGols(defaultInteger(request.gols()));
        entity.setDesarmes(defaultInteger(request.desarmes()));
        entity.setCartoesAmarelos(defaultInteger(request.cartoesAmarelos()));
        entity.setCartoesVermelhos(defaultInteger(request.cartoesVermelhos()));
        entity.setPassesChave(defaultInteger(request.passesChave()));
        entity.setKmPercorridos(request.kmPercorridos() == null ? BigDecimal.ZERO : request.kmPercorridos());
        entity.setNotaMedia(request.notaMedia());
        entity.setMinutosJogados(defaultInteger(request.minutosJogados()));
        entity.setFaltasSofridas(defaultInteger(request.faltasSofridas()));
        entity.setFaltasCometidas(defaultInteger(request.faltasCometidas()));
        entity.setImpedimentos(defaultInteger(request.impedimentos()));
        entity.setFinalizacoesGol(defaultInteger(request.finalizacoesGol()));
    }

    private void applyGoleiroFields(GoleiroEntity entity, GoleiroRequest request) {
        entity.setGolsSofridos(defaultInteger(request.golsSofridos()));
        entity.setReposicoes(defaultInteger(request.reposicoes()));
        entity.setPenaltisDefendidos(defaultInteger(request.penaltisDefendidos()));
        entity.setDefesasDificeis(defaultInteger(request.defesasDificeis()));
        entity.setJogosSemSofrerGol(defaultInteger(request.jogosSemSofrerGol()));
    }

    private JogadorEntity findJogador(Integer id) {
        return jogadorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("jogador nao encontrado"));
    }

    private PaisEntity findPaisOrNull(Integer id) {
        if (id == null) {
            return null;
        }
        return paisRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("pais nao encontrado"));
    }

    private EmpresarioEntity findEmpresarioOrNull(Integer id) {
        if (id == null) {
            return null;
        }
        return empresarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("empresario nao encontrado"));
    }

    private JogadorResponse toResponse(JogadorEntity jogador) {
        List<JogadorPosicaoResponse> posicoes = jogadorPosicaoRepository.findByJogadorIdOrderByOrdemAsc(jogador.getId())
                .stream()
                .map(this::toJogadorPosicaoResponse)
                .toList();

        JogadorLinhaResponse jogadorLinha = jogadorLinhaRepository.findById(jogador.getId())
                .map(this::toJogadorLinhaResponse)
                .orElse(null);

        GoleiroResponse goleiro = goleiroRepository.findById(jogador.getId())
                .map(this::toGoleiroResponse)
                .orElse(null);

        return new JogadorResponse(
                jogador.getId(),
                jogador.getNome(),
                jogador.getNomeCompleto(),
                jogador.getPerfilTexto(),
                jogador.getDataNascimento(),
                toPaisResumoResponse(jogador.getPais()),
                jogador.getValorMercado(),
                jogador.getTitulos(),
                jogador.getAlturaCm(),
                jogador.getPesoKg(),
                jogador.getPeDominante(),
                toEmpresarioResumoResponse(jogador.getEmpresario()),
                jogador.getAtivo(),
                jogador.getTipoJogador(),
                posicoes,
                jogadorLinha,
                goleiro
        );
    }

    private JogadorPosicaoResponse toJogadorPosicaoResponse(JogadorPosicaoEntity entity) {
        return new JogadorPosicaoResponse(
                entity.getPosicao().getId(),
                entity.getPosicao().getNome(),
                entity.getPosicao().getSigla(),
                entity.getOrdem()
        );
    }

    private PaisResumoResponse toPaisResumoResponse(PaisEntity pais) {
        if (pais == null) {
            return null;
        }
        return new PaisResumoResponse(pais.getId(), pais.getNome(), pais.getSigla());
    }

    private EmpresarioResumoResponse toEmpresarioResumoResponse(EmpresarioEntity empresario) {
        if (empresario == null) {
            return null;
        }
        return new EmpresarioResumoResponse(empresario.getId(), empresario.getNomeEmpresarial());
    }

    private JogadorLinhaResponse toJogadorLinhaResponse(JogadorLinhaEntity entity) {
        return new JogadorLinhaResponse(
                entity.getJogadorId(),
                entity.getGols(),
                entity.getDesarmes(),
                entity.getCartoesAmarelos(),
                entity.getCartoesVermelhos(),
                entity.getPassesChave(),
                entity.getKmPercorridos(),
                entity.getNotaMedia(),
                entity.getMinutosJogados(),
                entity.getFaltasSofridas(),
                entity.getFaltasCometidas(),
                entity.getImpedimentos(),
                entity.getFinalizacoesGol()
        );
    }

    private GoleiroResponse toGoleiroResponse(GoleiroEntity entity) {
        return new GoleiroResponse(
                entity.getJogadorId(),
                entity.getGolsSofridos(),
                entity.getReposicoes(),
                entity.getPenaltisDefendidos(),
                entity.getDefesasDificeis(),
                entity.getJogosSemSofrerGol()
        );
    }

    private Integer defaultInteger(Integer value) {
        return value == null ? 0 : value;
    }
}

