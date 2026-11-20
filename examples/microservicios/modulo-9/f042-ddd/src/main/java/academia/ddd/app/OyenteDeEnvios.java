package academia.ddd.app;

import academia.ddd.envios.PlanificadorDeEnvios;
import academia.ddd.ventas.PedidoConfirmado;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/** Adaptador: escucha el evento de Ventas y se lo entrega a la política de Envíos. */
@Component
class OyenteDeEnvios {

    private final PlanificadorDeEnvios planificador;

    OyenteDeEnvios(PlanificadorDeEnvios planificador) {
        this.planificador = planificador;
    }

    @EventListener
    void on(PedidoConfirmado evento) {
        planificador.alConfirmarsePedido(evento);
    }
}
