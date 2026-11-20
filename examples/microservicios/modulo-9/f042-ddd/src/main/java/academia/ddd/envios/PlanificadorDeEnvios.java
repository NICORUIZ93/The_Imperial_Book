package academia.ddd.envios;

import academia.ddd.ventas.PedidoConfirmado;
import java.util.ArrayList;
import java.util.List;

/**
 * Política de Envíos: «cuando Ventas confirma un pedido, planifica un envío».
 * Traduce el evento de Ventas al modelo propio (capa de traducción mínima): 1 bulto por cada 5 unidades.
 */
public final class PlanificadorDeEnvios {

    private final List<Envio> envios = new ArrayList<>();

    public Envio alConfirmarsePedido(PedidoConfirmado evento) {
        int bultos = (evento.unidades() + 4) / 5;
        Envio envio = new Envio("GUIA-" + (envios.size() + 1), evento.pedidoId(), evento.direccion(), bultos,
                Envio.Estado.POR_DESPACHAR);
        envios.add(envio);
        return envio;
    }

    public List<Envio> envios() {
        return List.copyOf(envios);
    }
}
