package com.scoutpro.backend.infrastructure.web.usuario;

public record UsuarioResponse(
        Integer id,
        String username,
        String nomeUsuario,
        String cpf,
        String email,
        String telefone
) {
}
