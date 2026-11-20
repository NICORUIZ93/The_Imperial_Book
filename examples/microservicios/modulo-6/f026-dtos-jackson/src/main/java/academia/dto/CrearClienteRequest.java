package academia.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** DTO de ENTRADA: solo lo que el cliente HTTP puede enviar. El JSON usa snake_case. */
public record CrearClienteRequest(
        @JsonProperty("nombre_completo") @NotBlank String nombreCompleto,
        @Email @NotBlank String email,
        @Size(min = 8) String clave,
        String telefono) { }
