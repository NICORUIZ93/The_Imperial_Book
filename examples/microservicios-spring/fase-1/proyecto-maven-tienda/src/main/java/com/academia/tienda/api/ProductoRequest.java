package com.academia.tienda.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProductoRequest(
        @NotBlank @Size(max = 160) String nombre,
        @NotNull @Positive BigDecimal precio
) {
}
