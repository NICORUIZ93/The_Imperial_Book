package academia.rest;

/** Lo que responde inventario: {"sku":"CAFE","disponibles":12}. Jackson 3 lo convierte en este record. */
public record Existencia(String sku, int disponibles) {
}
