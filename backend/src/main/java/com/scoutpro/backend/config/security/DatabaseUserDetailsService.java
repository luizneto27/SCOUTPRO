package com.scoutpro.backend.config.security;

import com.scoutpro.backend.infrastructure.persistence.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class DatabaseUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public DatabaseUserDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var user = usuarioRepository.findByUsernameAndAtivoTrue(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario nao encontrado"));

        return User.withUsername(user.getUsername())
                .password(user.getSenhaHash())
                .roles(user.getRole().name())
                .build();
    }
}
