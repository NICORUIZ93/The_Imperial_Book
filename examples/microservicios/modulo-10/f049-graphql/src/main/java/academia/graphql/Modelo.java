package academia.graphql;

/** Tipos del dominio. Los nombres de los componentes coinciden con los campos del esquema. */
final class Modelo {

    private Modelo() {
    }

    record Producto(String sku, String nombre, int precio) {
    }

    record Resena(String sku, int estrellas, String comentario) {
    }
}
