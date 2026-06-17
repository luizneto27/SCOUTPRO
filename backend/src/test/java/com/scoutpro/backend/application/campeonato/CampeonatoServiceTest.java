package com.scoutpro.backend.application.campeonato;

import com.scoutpro.backend.domain.enums.TipoCampeonato;
import com.scoutpro.backend.infrastructure.persistence.entity.CompeticaoEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.CompeticaoEdicaoEntity;
import com.scoutpro.backend.infrastructure.persistence.entity.PaisEntity;
import com.scoutpro.backend.infrastructure.persistence.repository.CompeticaoRepository;
import com.scoutpro.backend.infrastructure.persistence.repository.CompeticaoEdicaoRepository;
import com.scoutpro.backend.infrastructure.web.campeonato.CampeonatoRequest;
import com.scoutpro.backend.infrastructure.web.campeonato.CampeonatoResponse;
import com.scoutpro.backend.infrastructure.web.campeonato.CompeticaoEdicaoResponse;
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

import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CampeonatoService Unit Tests")
class CampeonatoServiceTest {

    @Mock
    private CompeticaoRepository competicaoRepository;

    @Mock
    private CompeticaoEdicaoRepository competicaoEdicaoRepository;

    @InjectMocks
    private CampeonatoService campeonatoService;

    private CampeonatoRequest campeonatoRequest;
    private CompeticaoEntity competicaoEntity;
    private CompeticaoEdicaoEntity edicaoEntity;
    private PaisEntity paisEntity;

    @BeforeEach
    void setUp() {
        paisEntity = new PaisEntity();
        paisEntity.setId(1);

        campeonatoRequest = new CampeonatoRequest(
                "Campeonato Brasileiro",
                1,
                TipoCampeonato.LIGA,
                "2024",
                1,
                100
        );

        competicaoEntity = new CompeticaoEntity();
        competicaoEntity.setId(1);
        competicaoEntity.setNome("Campeonato Brasileiro");
        competicaoEntity.setPais(paisEntity);
        competicaoEntity.setTipoCampeonato(TipoCampeonato.LIGA);

        edicaoEntity = new CompeticaoEdicaoEntity();
        edicaoEntity.setId(1);
        edicaoEntity.setCompeticao(competicaoEntity);
        edicaoEntity.setTemporada("2024");
        edicaoEntity.setDivisao(1);
        edicaoEntity.setRanking(100);
    }

    @Test
    @DisplayName("Should create a new campeonato successfully")
    void testCreate_Success() {
        // Arrange
        when(competicaoRepository.save(any(CompeticaoEntity.class)))
                .thenReturn(competicaoEntity);
        when(competicaoEdicaoRepository.save(any(CompeticaoEdicaoEntity.class)))
                .thenReturn(edicaoEntity);

        // Act
        CampeonatoResponse response = campeonatoService.create(campeonatoRequest);

        // Assert
        assertNotNull(response);
        assertEquals("Campeonato Brasileiro", response.nome());
        assertEquals(TipoCampeonato.LIGA, response.tipoCampeonato());
        assertEquals("2024", response.temporada());
        assertEquals(1, response.divisao());
        assertEquals(100, response.ranking());

        verify(competicaoRepository, times(1)).save(any(CompeticaoEntity.class));
        verify(competicaoEdicaoRepository, times(1)).save(any(CompeticaoEdicaoEntity.class));
    }

    @Test
    @DisplayName("Should get all campeonatos with pagination")
    void testGetAll_Success() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 20);
        Page<CompeticaoEntity> page = new PageImpl<>(
                Arrays.asList(competicaoEntity),
                pageable,
                1
        );

        competicaoEntity.setEdicoes(Arrays.asList(edicaoEntity));

        when(competicaoRepository.findAll(pageable))
                .thenReturn(page);

        // Act
        Page<CampeonatoResponse> response = campeonatoService.getAll(pageable);

        // Assert
        assertNotNull(response);
        assertEquals(1, response.getTotalElements());
        assertTrue(response.hasContent());

        CampeonatoResponse campeonato = response.getContent().get(0);
        assertEquals("Campeonato Brasileiro", campeonato.nome());
        assertEquals(TipoCampeonato.LIGA, campeonato.tipoCampeonato());

        verify(competicaoRepository, times(1)).findAll(pageable);
    }

    @Test
    @DisplayName("Should list competition editions by campeonato id")
    void testGetEdicoesByCampeonato_Success() {
        when(competicaoRepository.existsById(1)).thenReturn(true);
        when(competicaoEdicaoRepository.findAllByCompeticaoIdOrderByTemporadaDescIdDesc(1))
                .thenReturn(Arrays.asList(edicaoEntity));

        var response = campeonatoService.getEdicoesByCampeonato(1);

        assertNotNull(response);
        assertEquals(1, response.size());
        CompeticaoEdicaoResponse edicao = response.get(0);
        assertEquals(1, edicao.id());
        assertEquals(1, edicao.campeonatoId());
        assertEquals("Campeonato Brasileiro", edicao.campeonatoNome());
        assertEquals("2024", edicao.temporada());

        verify(competicaoRepository, times(1)).existsById(1);
        verify(competicaoEdicaoRepository, times(1)).findAllByCompeticaoIdOrderByTemporadaDescIdDesc(1);
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when campeonato does not exist for editions listing")
    void testGetEdicoesByCampeonato_NotFound() {
        when(competicaoRepository.existsById(999)).thenReturn(false);

        assertThrows(EntityNotFoundException.class,
                () -> campeonatoService.getEdicoesByCampeonato(999));

        verify(competicaoRepository, times(1)).existsById(999);
        verify(competicaoEdicaoRepository, never()).findAllByCompeticaoIdOrderByTemporadaDescIdDesc(any());
    }

    @Test
    @DisplayName("Should get competition edition by id")
    void testGetEdicaoById_Success() {
        when(competicaoEdicaoRepository.findById(1)).thenReturn(Optional.of(edicaoEntity));

        CompeticaoEdicaoResponse response = campeonatoService.getEdicaoById(1);

        assertNotNull(response);
        assertEquals(1, response.id());
        assertEquals(1, response.campeonatoId());
        assertEquals("Campeonato Brasileiro", response.campeonatoNome());
        assertEquals(TipoCampeonato.LIGA, response.tipoCampeonato());

        verify(competicaoEdicaoRepository, times(1)).findById(1);
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when competition edition does not exist")
    void testGetEdicaoById_NotFound() {
        when(competicaoEdicaoRepository.findById(999)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> campeonatoService.getEdicaoById(999));

        verify(competicaoEdicaoRepository, times(1)).findById(999);
    }

    @Test
    @DisplayName("Should update a campeonato successfully")
    void testUpdate_Success() {
        // Arrange
        Integer id = 1;
        when(competicaoRepository.findById(id))
                .thenReturn(Optional.of(competicaoEntity));
        when(competicaoRepository.save(any(CompeticaoEntity.class)))
                .thenReturn(competicaoEntity);
        when(competicaoEdicaoRepository.save(any(CompeticaoEdicaoEntity.class)))
                .thenReturn(edicaoEntity);

        competicaoEntity.setEdicoes(Arrays.asList(edicaoEntity));

        // Act
        CampeonatoResponse response = campeonatoService.update(id, campeonatoRequest);

        // Assert
        assertNotNull(response);
        assertEquals("Campeonato Brasileiro", response.nome());

        verify(competicaoRepository, times(1)).findById(id);
        verify(competicaoRepository, times(1)).save(any(CompeticaoEntity.class));
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when updating non-existent campeonato")
    void testUpdate_NotFound() {
        // Arrange
        Integer id = 999;
        when(competicaoRepository.findById(id))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class,
                () -> campeonatoService.update(id, campeonatoRequest));

        verify(competicaoRepository, times(1)).findById(id);
        verify(competicaoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should delete a campeonato successfully")
    void testDelete_Success() {
        // Arrange
        Integer id = 1;
        when(competicaoRepository.findById(id))
                .thenReturn(Optional.of(competicaoEntity));

        // Act
        campeonatoService.delete(id);

        // Assert
        verify(competicaoRepository, times(1)).findById(id);
        verify(competicaoRepository, times(1)).delete(competicaoEntity);
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when deleting non-existent campeonato")
    void testDelete_NotFound() {
        // Arrange
        Integer id = 999;
        when(competicaoRepository.findById(id))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class,
                () -> campeonatoService.delete(id));

        verify(competicaoRepository, times(1)).findById(id);
        verify(competicaoRepository, never()).delete(any());
    }
}
