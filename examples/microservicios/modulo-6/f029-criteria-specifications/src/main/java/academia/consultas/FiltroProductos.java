package academia.consultas;

import java.math.BigDecimal;

/** Lo que llega de la pantalla de búsqueda: cualquier campo puede venir vacío (null). */
public record FiltroProductos(String texto, String categoria, BigDecimal precioMin,
                              BigDecimal precioMax, Boolean soloActivos) { }
