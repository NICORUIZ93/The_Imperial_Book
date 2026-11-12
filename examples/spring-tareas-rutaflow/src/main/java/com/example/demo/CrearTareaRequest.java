package com.example.demo;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CrearTareaRequest(
        @NotBlank(message = "Escribe un título.")
        String titulo,
        @Min(value = 1, message = "La prioridad mínima es 1.")
        int prioridad) {
}
