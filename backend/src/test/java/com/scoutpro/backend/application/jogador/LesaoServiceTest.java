package com.scoutpro.backend.application.jogador;

import com.scoutpro.backend.application.common.ResourceNotFoundException;
import com.scoutpro.backend.domain.enums.GravidadeLesao;
import com.scoutpro.backend.domain.enums.StatusRecuperacaoLesao;
import com.scoutpro.backend.infrastructure.persistence.entity.JogadorEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.LesaoEntity;
import com.scoutpro.backend.infrastructure.persistence.repository.JogadorRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.LesaoRepository;
import com.scoutpro.backend.infrastructure.web.jogador.LesaoRequest;
import com.scoutpro.backend.infrastructure.web.jogador.LesaoResumoResponse;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("LesaoService Unit Tests")
class LesaoServiceTest {

    @Mock
    private LesaoRepository lesaoRepository;

    @Mock
    private JogadorRepository jogadorRepository;

    @InjectMocks
    private LesaoService lesaoService;

    private JogadorEntity jogador;
    private LesaoEntity lesao;
    private LesaoRequest request;

    @BeforeEach
    void setUp() {
        jogador = new JogadorEntity();
        jogador.setId(7);
        jogador.setNome("Joao Silva");

        lesao = new LesaoEntity();
        lesao.setId(3);
        lesao.setJogador(jogador);
        lesao.setDataLesao(LocalDate.now().minusDays(10));
        lesao.setTipoLesao("Entorse");
        lesao.setGravidade(GravidadeLesao.MODERADA);
        lesao.setStatusRecuperacao(StatusRecuperacaoLesao.EM_RECUPERACAO);
        lesao.setTempoRecuperacao(14);

        request = new LesaoRequest(
                7,
                LocalDate.now().minusDays(2),
                "Lesao muscular",
                GravidadeLesao.LEVE,
                StatusRecuperacaoLesao.EM_RECUPERACAO,
                10
        );
    }

    @Test
    @DisplayName("Should create lesao successfully")
    void createSuccess() {
        when(jogadorRepository.findById(7)).thenReturn(Optional.of(jogador));
        when(lesaoRepository.save(any(LesaoEntity.class))).thenAnswer(invocation -> {
            LesaoEntity entity = invocation.getArgument(0);
            entity.setId(10);
            return entity;
        });

        var response = lesaoService.create(request);

        assertEquals(10, response.id());
        assertEquals(7, response.jogadorId());
        assertEquals("Joao Silva", response.jogadorNome());
        assertEquals(request.dataLesao().plusDays(request.tempoRecuperacao()), response.dataPrevistaRetorno());
        verify(jogadorRepository, times(1)).findById(7);
        verify(lesaoRepository, times(1)).save(any(LesaoEntity.class));
    }

    @Test
    @DisplayName("Should list lesoes with sort")
    void listSuccess() {
        when(lesaoRepository.findAll(any(Specification.class), any(Sort.class))).thenReturn(List.of(lesao));

        var response = lesaoService.list(null, null, null);

        assertEquals(1, response.size());
        assertEquals(3, response.get(0).id());
        verify(lesaoRepository, times(1)).findAll(any(Specification.class), any(Sort.class));
    }

    @Test
    @DisplayName("Should get lesao by id")
    void getByIdSuccess() {
        when(lesaoRepository.findById(3)).thenReturn(Optional.of(lesao));

        var response = lesaoService.getById(3);

        assertEquals(3, response.id());
        assertEquals("Entorse", response.tipoLesao());
    }

    @Test
    @DisplayName("Should update lesao successfully")
    void updateSuccess() {
        when(lesaoRepository.findById(3)).thenReturn(Optional.of(lesao));
        when(jogadorRepository.findById(7)).thenReturn(Optional.of(jogador));

        var response = lesaoService.update(3, request);

        assertEquals("Lesao muscular", response.tipoLesao());
        assertEquals(GravidadeLesao.LEVE, response.gravidade());
    }

    @Test
    @DisplayName("Should delete lesao successfully")
    void deleteSuccess() {
        when(lesaoRepository.findById(3)).thenReturn(Optional.of(lesao));

        lesaoService.delete(3);

        verify(lesaoRepository, times(1)).delete(lesao);
    }

    @Test
    @DisplayName("Should throw when jogador does not exist")
    void createJogadorNotFound() {
        when(jogadorRepository.findById(7)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> lesaoService.create(request));

        verify(lesaoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should compute resumo from filtered lesions")
    void resumoSuccess() {
        LocalDate hoje = LocalDate.now();

        LesaoEntity recuperada = new LesaoEntity();
        recuperada.setId(4);
        recuperada.setJogador(jogador);
        recuperada.setDataLesao(hoje.minusDays(20));
        recuperada.setTipoLesao("Fadiga");
        recuperada.setStatusRecuperacao(StatusRecuperacaoLesao.RECUPERADO);
        recuperada.setTempoRecuperacao(5);

        LesaoEntity semStatusAindaAtiva = new LesaoEntity();
        semStatusAindaAtiva.setId(5);
        semStatusAindaAtiva.setJogador(jogador);
        semStatusAindaAtiva.setDataLesao(hoje.minusDays(1));
        semStatusAindaAtiva.setTipoLesao("Contusao");
        semStatusAindaAtiva.setTempoRecuperacao(4);

        LesaoEntity semStatusJaRecuperada = new LesaoEntity();
        semStatusJaRecuperada.setId(6);
        semStatusJaRecuperada.setJogador(jogador);
        semStatusJaRecuperada.setDataLesao(hoje.minusDays(12));
        semStatusJaRecuperada.setTipoLesao("Entorse leve");
        semStatusJaRecuperada.setTempoRecuperacao(3);

        when(lesaoRepository.findAll(any(Specification.class))).thenReturn(List.of(
                lesao,
                recuperada,
                semStatusAindaAtiva,
                semStatusJaRecuperada
        ));

        LesaoResumoResponse response = lesaoService.getResumo(null);

        assertNotNull(response);
        assertEquals(4, response.totalRegistros());
        assertEquals(2, response.noDepartamentoMedico());
        assertEquals(2, response.recuperadas());
        assertEquals(2, response.retornoPrevistoProximos7Dias());
        verify(lesaoRepository, times(1)).findAll(any(Specification.class));
    }
}
