package com.scoutpro.backend.infrastructure.web.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateUsuarioRequest(
        @NotBlank @Size(max = 80) String username,
        @NotBlank @Size(max = 120) String nomeUsuario,
        @NotBlank
        @Pattern(
                regexp = "^(\\d{11}|\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2})$",
                message = "cpf must be 11 digits or formatted as XXX.XXX.XXX-XX"
        )
        String cpf,
        @NotBlank @Email @Size(max = 150) String email,
        @Size(max = 20) String telefone,
        @NotBlank @Size(min = 6, max = 100) String senha
) {
}
