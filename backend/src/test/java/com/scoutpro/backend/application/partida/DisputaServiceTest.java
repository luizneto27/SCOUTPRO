package com.scoutpro.backend.application.partida;

import com.scoutpro.backend.application.common.ConflictException;
import com.scoutpro.backend.application.common.ResourceNotFoundException;
import com.scoutpro.backend.infrastructure.persistence.entity.ContratoEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.DisputaEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.DisputaId;
import com.scoutpro.backend.infrastructure.persistence.entity.JogadorEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.PartidaEntity;
import com.scoutpro.backend.infrastructure.persistence.repository.ContratoRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.DisputaRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.JogadorRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.PartidaRepository;
import com.scoutpro.backend.infrastructure.web.partida.DisputaRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("DisputaService Unit Tests")
class DisputaServiceTest {

    @Mock
    private DisputaRepository disputaRepository;

    @Mock
    private JogadorRepository jogadorRepository;

    @Mock
    private PartidaRepository partidaRepository;

    @Mock
    private ContratoRepository contratoRepository;

    @InjectMocks
    private DisputaService disputaService;

    private JogadorEntity jogador;
    private PartidaEntity partida;
    private DisputaEntity disputa;
    private DisputaRequest request;

    @BeforeEach
    void setUp() {
        jogador = new JogadorEntity();
        jogador.setId(9);
        jogador.setNome("Pedro Santos");

        partida = new PartidaEntity();
        partida.setId(15);
        partida.setData(LocalDate.of(2026, 6, 10));

        disputa = new DisputaEntity();
        disputa.setId(new DisputaId(9, 15));
        disputa.setJogador(jogador);
        disputa.setPartida(partida);
        disputa.setGolsPartida(1);

        request = new DisputaRequest(
                9,
                1,
                2,
                1,
                0,
                1,
                0,
                0,
                new BigDecimal("10.50"),
                3,
                2,
                90,
                new BigDecimal("8.5"),
                0,
                0,
                0,
                0,
                false
        );
    }

    @Test
    @DisplayName("Should list disputas by partida")
    void listByPartidaSuccess() {
        when(partidaRepository.existsById(15)).thenReturn(true);
        when(disputaRepository.findAllByPartidaIdOrderByJogadorNomeAsc(15)).thenReturn(List.of(disputa));

        var response = disputaService.listByPartida(15);

        assertEquals(1, response.size());
        assertEquals(9, response.get(0).jogadorId());
    }

    @Test
    @DisplayName("Should create disputa successfully when contract is valid")
    void createSuccess() {
        when(partidaRepository.findById(15)).thenReturn(Optional.of(partida));
        when(jogadorRepository.findById(9)).thenReturn(Optional.of(jogador));
        when(disputaRepository.existsById(new DisputaId(9, 15))).thenReturn(false);
        when(contratoRepository.findContratosValidosByJogadorIdAndDataReferencia(9, partida.getData()))
                .thenReturn(List.of(new ContratoEntity()));
        when(disputaRepository.saveAndFlush(any(DisputaEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = disputaService.create(15, request);

        assertEquals(9, response.jogadorId());
        assertEquals(15, response.partidaId());
        assertEquals(1, response.golsPartida());
    }

    @Test
    @DisplayName("Should reject disputa without valid contract")
    void createWithoutContract() {
        when(partidaRepository.findById(15)).thenReturn(Optional.of(partida));
        when(jogadorRepository.findById(9)).thenReturn(Optional.of(jogador));
        when(disputaRepository.existsById(new DisputaId(9, 15))).thenReturn(false);
        when(contratoRepository.findContratosValidosByJogadorIdAndDataReferencia(9, partida.getData()))
                .thenReturn(List.of());

        assertThrows(ConflictException.class, () -> disputaService.create(15, request));

        verify(disputaRepository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("Should reject duplicate disputa")
    void createDuplicate() {
        when(partidaRepository.findById(15)).thenReturn(Optional.of(partida));
        when(jogadorRepository.findById(9)).thenReturn(Optional.of(jogador));
        when(disputaRepository.existsById(new DisputaId(9, 15))).thenReturn(true);

        assertThrows(ConflictException.class, () -> disputaService.create(15, request));
        verify(contratoRepository, never()).findContratosValidosByJogadorIdAndDataReferencia(any(), any());
    }

    @Test
    @DisplayName("Should update disputa successfully")
    void updateSuccess() {
        when(disputaRepository.findById(new DisputaId(9, 15))).thenReturn(Optional.of(disputa));
        when(contratoRepository.findContratosValidosByJogadorIdAndDataReferencia(9, partida.getData()))
                .thenReturn(List.of(new ContratoEntity()));
        when(disputaRepository.saveAndFlush(any(DisputaEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = disputaService.update(15, 9, request);

        assertEquals(new BigDecimal("8.5"), response.notaPartida());
        assertEquals(90, response.minutosJogadosPartida());
    }

    @Test
    @DisplayName("Should reject update when jogadorId differs from path")
    void updateJogadorMismatch() {
        DisputaRequest otherRequest = new DisputaRequest(
                10, 1, 2, 1, 0, 1, 0, 0, new BigDecimal("10.50"), 3, 2, 90, new BigDecimal("8.5"), 0, 0, 0, 0, false
        );

        assertThrows(IllegalArgumentException.class, () -> disputaService.update(15, 9, otherRequest));
        verify(disputaRepository, never()).findById(any());
    }

    @Test
    @DisplayName("Should delete disputa successfully")
    void deleteSuccess() {
        when(disputaRepository.findById(new DisputaId(9, 15))).thenReturn(Optional.of(disputa));

        disputaService.delete(15, 9);

        verify(disputaRepository, times(1)).delete(disputa);
        verify(disputaRepository, times(1)).flush();
    }

    @Test
    @DisplayName("Should throw not found when partida does not exist on list")
    void listByPartidaNotFound() {
        when(partidaRepository.existsById(99)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> disputaService.listByPartida(99));
    }
}
