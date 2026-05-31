package com.scoutpro.backend.config.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.security")
public class SecurityProperties {

    private String jwtSecret;
    private long jwtExpirationSeconds;
    private BootstrapAdmin bootstrapAdmin = new BootstrapAdmin();

    @Getter
    @Setter
    public static class BootstrapAdmin {
        private String username;
        private String password;
        private String nomeUsuario;
        private String cpf;
        private String email;
        private String telefone;
    }
}
