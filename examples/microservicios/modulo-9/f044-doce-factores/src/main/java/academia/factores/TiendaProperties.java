package academia.factores;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Factor III (Config): la configuración vive en el entorno, tipada y validada al arrancar.
 * Si falta o es inválida, el proceso no arranca (mejor que fallar a las 3 a. m. con el primer cliente).
 */
@Validated
@ConfigurationProperties("tienda")
public record TiendaProperties(
        @NotBlank @Pattern(regexp = "[A-Z]{3}", message = "debe ser un código ISO 4217 de 3 letras") String moneda,
        @Min(0) @Max(50) int descuentoMaximo) {
}
