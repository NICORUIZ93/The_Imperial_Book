package academia.ddd.app;

import academia.ddd.ventas.Dinero;
import academia.ddd.ventas.Pedido;
import java.util.HashMap;
import java.util.Map;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

/**
 * Servicio de aplicación: carga el agregado, le pide el cambio, lo guarda y publica sus eventos.
 * El repositorio es un mapa en memoria para que el foco esté en el modelo (persistencia: Módulo 2).
 */
@Service
public class ServicioDeVentas {

    private final Map<String, Pedido> repositorio = new HashMap<>();
    private final ApplicationEventPublisher publicador;

    public ServicioDeVentas(ApplicationEventPublisher publicador) {
        this.publicador = publicador;
    }

    public Pedido crear(String id, String clienteId) {
        Pedido pedido = new Pedido(id, clienteId);
        repositorio.put(id, pedido);
        return pedido;
    }

    public void agregar(String pedidoId, String sku, int cantidad, long precioPesos) {
        repositorio.get(pedidoId).agregar(sku, cantidad, new Dinero(precioPesos));
    }

    public void confirmar(String pedidoId, String direccion) {
        Pedido pedido = repositorio.get(pedidoId);
        pedido.confirmar(direccion);
        repositorio.put(pedidoId, pedido);                          // «guardar» el agregado completo
        pedido.extraerEventos().forEach(publicador::publishEvent);  // y después publicar lo que pasó
    }
}
