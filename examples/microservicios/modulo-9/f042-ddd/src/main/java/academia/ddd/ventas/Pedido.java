package academia.ddd.ventas;

import java.util.ArrayList;
import java.util.List;

/**
 * Raíz del agregado Pedido (contexto Ventas). Todas las reglas del pedido viven aquí:
 *  1. Solo se agregan líneas mientras el pedido está en BORRADOR.
 *  2. Un pedido no puede superar 20 unidades en total (regla del negocio de ejemplo).
 *  3. Un pedido vacío no se puede confirmar.
 * Al confirmarse, registra el evento PedidoConfirmado; quien guarda el agregado lo publica.
 */
public final class Pedido {

    public enum Estado { BORRADOR, CONFIRMADO }

    static final int MAXIMO_UNIDADES = 20;

    private final String id;
    private final String clienteId;
    private final List<LineaDePedido> lineas = new ArrayList<>();
    private final List<Object> eventos = new ArrayList<>();
    private Estado estado = Estado.BORRADOR;

    public Pedido(String id, String clienteId) {
        this.id = id;
        this.clienteId = clienteId;
    }

    public void agregar(String sku, int cantidad, Dinero precioUnitario) {
        exigirBorrador();
        if (cantidad <= 0) {
            throw new ReglaDeNegocioViolada("la cantidad debe ser mayor que 0");
        }
        if (unidades() + cantidad > MAXIMO_UNIDADES) {
            throw new ReglaDeNegocioViolada("un pedido no puede superar " + MAXIMO_UNIDADES + " unidades");
        }
        lineas.add(new LineaDePedido(sku, cantidad, precioUnitario));
    }

    public void confirmar(String direccion) {
        exigirBorrador();
        if (lineas.isEmpty()) {
            throw new ReglaDeNegocioViolada("un pedido vacío no se puede confirmar");
        }
        estado = Estado.CONFIRMADO;
        eventos.add(new PedidoConfirmado(id, clienteId, direccion, total().pesos(), unidades()));
    }

    /** Entrega los eventos pendientes y los borra: cada evento se publica una sola vez. */
    public List<Object> extraerEventos() {
        List<Object> pendientes = List.copyOf(eventos);
        eventos.clear();
        return pendientes;
    }

    public Dinero total() {
        return lineas.stream().map(LineaDePedido::subtotal).reduce(Dinero.CERO, Dinero::mas);
    }

    public int unidades() {
        return lineas.stream().mapToInt(LineaDePedido::cantidad).sum();
    }

    /** Copia inmutable: desde fuera nadie puede saltarse las reglas agregando líneas a la lista. */
    public List<LineaDePedido> lineas() {
        return List.copyOf(lineas);
    }

    public String id() {
        return id;
    }

    public Estado estado() {
        return estado;
    }

    private void exigirBorrador() {
        if (estado != Estado.BORRADOR) {
            throw new ReglaDeNegocioViolada("el pedido " + id + " ya está " + estado);
        }
    }
}
