package academia.perfiles;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/** Configuración tipada: tienda.descuento-maximo -> descuentoMaximo (relaxed binding). */
@Validated
@ConfigurationProperties("tienda")
public record TiendaProperties(
        @NotBlank String moneda,
        @Min(0) @Max(50) int descuentoMaximo,
        @NotBlank String bdUrl) { }
