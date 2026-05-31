package com.scoutpro.backend.application.usuario;

import com.scoutpro.backend.domain.enums.UsuarioRole;
import com.scoutpro.backend.infrastructure.persistence.entity.UsuarioEntity;
import com.scoutpro.backend.infrastructure.persistence.repository.UsuarioRepository;
import com.scoutpro.backend.infrastructure.web.usuario.CreateUsuarioRequest;
import com.scoutpro.backend.infrastructure.web.usuario.UsuarioResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UsuarioResponse create(CreateUsuarioRequest request) {
        if (usuarioRepository.existsByUsername(request.username()) ||
                usuarioRepository.existsByCpf(request.cpf()) ||
                usuarioRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("username, cpf ou email ja cadastrado");
        }

        UsuarioEntity entity = new UsuarioEntity();
        entity.setUsername(request.username());
        entity.setNomeUsuario(request.nomeUsuario());
        entity.setCpf(request.cpf());
        entity.setEmail(request.email());
        entity.setTelefone(request.telefone());
        entity.setSenhaHash(passwordEncoder.encode(request.senha()));
        entity.setRole(UsuarioRole.USER);
        entity.setAtivo(true);

        UsuarioEntity saved = usuarioRepository.save(entity);
        return new UsuarioResponse(saved.getId(), saved.getUsername(), saved.getNomeUsuario(), saved.getCpf(), saved.getEmail(), saved.getTelefone());
    }
}
