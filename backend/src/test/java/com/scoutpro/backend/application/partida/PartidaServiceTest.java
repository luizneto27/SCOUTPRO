package com.scoutpro.backend.application.partida;

import com.scoutpro.backend.infrastructure.persistence.entity.CompeticaoEdicaoEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.PartidaEntity;
import com.scoutpro.backend.infrastructure.persistence.repository.CompeticaoEdicaoRepository;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
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
    private CompeticaoEdicaoRepository competicaoEdicaoRepository;

    @InjectMocks
    private PartidaService partidaService;

    private PartidaRequest partidaRequest;
    private CompeticaoEdicaoEntity competicaoEdicaoEntity;
    private PartidaEntity partidaEntity;

    @BeforeEach
    void setUp() {
        competicaoEdicaoEntity = new CompeticaoEdicaoEntity();
        competicaoEdicaoEntity.setId(10);

        partidaRequest = new PartidaRequest(
                LocalDate.of(2024, 1, 1),
                10
        );

        partidaEntity = new PartidaEntity();
        partidaEntity.setId(1);
        partidaEntity.setData(partidaRequest.data());
        partidaEntity.setCompeticaoEdicao(competicaoEdicaoEntity);
    }

    @Test
    @DisplayName("Should create a new partida successfully")
    void testCreate_Success() {
        when(competicaoEdicaoRepository.findById(10)).thenReturn(Optional.of(competicaoEdicaoEntity));
        when(partidaRepository.save(any(PartidaEntity.class))).thenReturn(partidaEntity);

        PartidaResponse response = partidaService.create(partidaRequest);

        assertNotNull(response);
        assertEquals(partidaRequest.data(), response.data());
        assertEquals(partidaRequest.competicaoEdicaoId(), response.competicaoEdicaoId());

        verify(competicaoEdicaoRepository, times(1)).findById(10);
        verify(partidaRepository, times(1)).save(any(PartidaEntity.class));
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when competition edition not found on create")
    void testCreate_CompeticaoEdicaoNotFound() {
        when(competicaoEdicaoRepository.findById(10)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> partidaService.create(partidaRequest));

        verify(competicaoEdicaoRepository, times(1)).findById(10);
        verify(partidaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should list partidas by campeonato id")
    void testGetByCampeonato_Success() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<PartidaEntity> page = new PageImpl<>(List.of(partidaEntity), pageable, 1);

        when(partidaRepository.findByCompeticaoEdicaoCompeticaoId(1, pageable)).thenReturn(page);

        Page<PartidaResponse> response = partidaService.getByCampeonato(1, pageable);

        assertNotNull(response);
        assertEquals(1, response.getTotalElements());
        assertEquals(partidaEntity.getId(), response.getContent().get(0).id());
        assertEquals(partidaEntity.getData(), response.getContent().get(0).data());
        assertEquals(competicaoEdicaoEntity.getId(), response.getContent().get(0).competicaoEdicaoId());

        verify(partidaRepository, times(1)).findByCompeticaoEdicaoCompeticaoId(1, pageable);
    }

    @Test
    @DisplayName("Should update a partida successfully")
    void testUpdate_Success() {
        when(partidaRepository.findById(1)).thenReturn(Optional.of(partidaEntity));
        when(competicaoEdicaoRepository.findById(10)).thenReturn(Optional.of(competicaoEdicaoEntity));
        when(partidaRepository.save(any(PartidaEntity.class))).thenReturn(partidaEntity);

        PartidaResponse response = partidaService.update(1, partidaRequest);

        assertNotNull(response);
        assertEquals(partidaRequest.data(), response.data());
        assertEquals(partidaRequest.competicaoEdicaoId(), response.competicaoEdicaoId());

        verify(partidaRepository, times(1)).findById(1);
        verify(competicaoEdicaoRepository, times(1)).findById(10);
        verify(partidaRepository, times(1)).save(any(PartidaEntity.class));
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when competition edition not found on update")
    void testUpdate_CompeticaoEdicaoNotFound() {
        when(partidaRepository.findById(1)).thenReturn(Optional.of(partidaEntity));
        when(competicaoEdicaoRepository.findById(10)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> partidaService.update(1, partidaRequest));

        verify(partidaRepository, times(1)).findById(1);
        verify(competicaoEdicaoRepository, times(1)).findById(10);
        verify(partidaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should delete a partida successfully")
    void testDelete_Success() {
        when(partidaRepository.findById(1)).thenReturn(Optional.of(partidaEntity));

        partidaService.delete(1);

        verify(partidaRepository, times(1)).findById(1);
        verify(partidaRepository, times(1)).delete(partidaEntity);
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when deleting non-existent partida")
    void testDelete_NotFound() {
        when(partidaRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> partidaService.delete(1));

        verify(partidaRepository, times(1)).findById(1);
        verify(partidaRepository, never()).delete(any());
    }
}
