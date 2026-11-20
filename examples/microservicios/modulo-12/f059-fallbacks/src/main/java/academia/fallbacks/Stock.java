package academia.fallbacks;

/** stock = null: desconocido. fuente: "inventario", "cache" o "defecto". edadMs: antigüedad del dato. */
public record Stock(String sku, Integer stock, String fuente, long edadMs) {

    Stock conFuente(String nuevaFuente, long edad) {
        return new Stock(sku, stock, nuevaFuente, edad);
    }
}
