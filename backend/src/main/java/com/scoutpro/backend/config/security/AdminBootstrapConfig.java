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
            if (usuarioRepository.existsByRoleAndAtivoTrue(UsuarioRole.ADMIN)) {
                return;
            }

            var cfg = securityProperties.getBootstrapAdmin();
            var existingAdmin = usuarioRepository.findFirstByRoleOrderByIdAsc(UsuarioRole.ADMIN);

            if (existingAdmin.isPresent()) {
                UsuarioEntity admin = existingAdmin.get();
                admin.setUsername(cfg.getUsername());
                admin.setNomeUsuario(cfg.getNomeUsuario());
                admin.setCpf(cfg.getCpf());
                admin.setEmail(cfg.getEmail());
                admin.setTelefone(cfg.getTelefone());
                admin.setSenhaHash(passwordEncoder.encode(cfg.getPassword()));
                admin.setAtivo(true);
                usuarioRepository.save(admin);
                return;
            }

            UsuarioEntity newAdmin = new UsuarioEntity();
            newAdmin.setUsername(cfg.getUsername());
            newAdmin.setNomeUsuario(cfg.getNomeUsuario());
            newAdmin.setCpf(cfg.getCpf());
            newAdmin.setEmail(cfg.getEmail());
            newAdmin.setTelefone(cfg.getTelefone());
            newAdmin.setSenhaHash(passwordEncoder.encode(cfg.getPassword()));
            newAdmin.setRole(UsuarioRole.ADMIN);
            newAdmin.setAtivo(true);

            usuarioRepository.save(newAdmin);
        };
    }
}
