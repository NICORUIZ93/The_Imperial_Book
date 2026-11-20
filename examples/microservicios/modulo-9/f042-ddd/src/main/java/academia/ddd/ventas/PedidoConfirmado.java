package academia.ddd.ventas;

/**
 * Evento de dominio: algo que YA pasó en Ventas, en pasado y con los datos que otros contextos necesitan.
 * Es el «lenguaje publicado» de Ventas: los demás contextos dependen de este registro, no de Pedido.
 */
public record PedidoConfirmado(String pedidoId, String clienteId, String direccion, long totalPesos, int unidades) {
}
