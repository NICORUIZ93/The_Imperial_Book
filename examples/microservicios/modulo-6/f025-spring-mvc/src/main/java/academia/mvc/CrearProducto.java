package academia.mvc;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/** Cuerpo de POST /productos. Las anotaciones son las reglas que @Valid comprueba. */
public record CrearProducto(
        @NotBlank @Size(max = 80) String nombre,
        @Positive BigDecimal precio) { }
