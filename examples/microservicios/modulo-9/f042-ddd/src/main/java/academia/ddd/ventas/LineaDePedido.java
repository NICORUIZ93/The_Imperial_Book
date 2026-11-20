package academia.ddd.ventas;

/** Entidad interna del agregado: solo se crea y se modifica a través de Pedido. */
public record LineaDePedido(String sku, int cantidad, Dinero precioUnitario) {

    Dinero subtotal() {
        return precioUnitario.por(cantidad);
    }
}
