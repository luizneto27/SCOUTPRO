package com.scoutpro.backend.application.partida;

import com.scoutpro.backend.infrastructure.persistence.entity.CompeticaoEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.PartidaEntity;
import com.scoutpro.backend.infrastructure.persistence.repository.CompeticaoRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.PartidaRepository;
import com.scoutpro.backend.infrastructure.web.partida.PartidaRequest;
import com.scoutpro.backend.infrastructure.web.partida.PartidaResponse;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PartidaService Unit Tests")
class PartidaServiceTest {

    @Mock
    private PartidaRepository partidaRepository;

    @Mock
    private CompeticaoRepository competicaoRepository;

    @InjectMocks
    private PartidaService partidaService;

    private PartidaRequest partidaRequest;
    private CompeticaoEntity competicaoEntity;
    private PartidaEntity partidaEntity;

    @BeforeEach
    void setUp() {
        competicaoEntity = new CompeticaoEntity();
        competicaoEntity.setId(1);

        partidaRequest = new PartidaRequest(
                LocalDate.of(2024, 1, 1),
                1
        );

        partidaEntity = new PartidaEntity();
        partidaEntity.setId(1);
        partidaEntity.setData(partidaRequest.data());
        partidaEntity.setCompeticao(competicaoEntity);
    }

    @Test
    @DisplayName("Should create a new partida successfully")
    void testCreate_Success() {
        when(competicaoRepository.findById(1)).thenReturn(Optional.of(competicaoEntity));
        when(partidaRepository.save(any(PartidaEntity.class))).thenReturn(partidaEntity);

        PartidaResponse response = partidaService.create(partidaRequest);

        assertNotNull(response);
        assertEquals(partidaRequest.data(), response.data());
        assertEquals(partidaRequest.campeonatoId(), response.campeonatoId());

        verify(competicaoRepository, times(1)).findById(1);
        verify(partidaRepository, times(1)).save(any(PartidaEntity.class));
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when campeonato not found on create")
    void testCreate_CampeonatoNotFound() {
        when(competicaoRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> partidaService.create(partidaRequest));

        verify(competicaoRepository, times(1)).findById(1);
        verify(partidaRepository, never()).save(any());
    }
}
