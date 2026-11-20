package academia.consumidor;

/** Lo ÚNICO que la tienda necesita del catálogo. Lo que no está aquí, el contrato no lo exige. */
public record Producto(long id, String nombre, int precio) {
}
