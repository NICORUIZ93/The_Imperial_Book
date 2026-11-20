package academia.motores;

/** "Suma stock; si el SKU no existe, créalo" en UNA sentencia atómica (upsert). */
public interface Inventario {
    void sumarStock(String sku, String nombre, int cantidad);
}
