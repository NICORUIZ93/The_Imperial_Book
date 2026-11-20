package academia.resiliencia;

/** Respuesta del inventario. stock = null significa "desconocido"; fuente dice de dónde salió. */
public record Stock(String sku, Integer stock, String fuente) {}
