package academia.proveedor;

/** El proveedor puede tener MÁS campos que los que pide el consumidor (stock): eso no rompe el contrato. */
public record Producto(long id, String nombre, int precio, int stock) {
}
