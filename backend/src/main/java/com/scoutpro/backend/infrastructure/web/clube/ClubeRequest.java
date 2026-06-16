package com.scoutpro.backend.infrastructure.web.clube;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record ClubeRequest(
        @NotBlank
        @Pattern(
                regexp = "^(\\d{14}|\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2})$",
                message = "cnpj must be 14 digits or formatted as XX.XXX.XXX/XXXX-XX"
        )
        String cnpj,
        @NotBlank @Size(max = 100) String nome,
        @NotNull @JsonProperty("pais_id") Integer paisId,
        @Size(max = 100) String cidade,
        @PastOrPresent LocalDate fundacao
) {
}
