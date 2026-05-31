package com.scoutpro.backend.config.security;

import com.scoutpro.backend.domain.enums.UsuarioRole;
import com.scoutpro.backend.infrastructure.persistence.entity.UsuarioEntity;
import com.scoutpro.backend.infrastructure.persistence.repository.UsuarioRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminBootstrapConfig {

    @Bean
    public ApplicationRunner bootstrapAdmin(SecurityProperties securityProperties,
                                            UsuarioRepository usuarioRepository,
                                            PasswordEncoder passwordEncoder) {
        return args -> {
            if (usuarioRepository.existsByRole(UsuarioRole.ADMIN)) {
                return;
            }

            var cfg = securityProperties.getBootstrapAdmin();
            UsuarioEntity admin = new UsuarioEntity();
            admin.setUsername(cfg.getUsername());
            admin.setNomeUsuario(cfg.getNomeUsuario());
            admin.setCpf(cfg.getCpf());
            admin.setEmail(cfg.getEmail());
            admin.setTelefone(cfg.getTelefone());
            admin.setSenhaHash(passwordEncoder.encode(cfg.getPassword()));
            admin.setRole(UsuarioRole.ADMIN);
            admin.setAtivo(true);

            usuarioRepository.save(admin);
        };
    }
}
