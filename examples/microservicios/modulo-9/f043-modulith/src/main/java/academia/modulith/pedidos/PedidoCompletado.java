package academia.modulith.pedidos;

/** Evento publicado por el módulo pedidos. Está en el paquete raíz: es parte de su API. */
public record PedidoCompletado(String pedidoId, String sku, int cantidad) {
}
