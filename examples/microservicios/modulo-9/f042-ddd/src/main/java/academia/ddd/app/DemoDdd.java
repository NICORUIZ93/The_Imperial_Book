package academia.ddd.app;

import academia.ddd.envios.PlanificadorDeEnvios;
import academia.ddd.ventas.Dinero;
import academia.ddd.ventas.Pedido;
import academia.ddd.ventas.PedidoConfirmado;
import academia.ddd.ventas.ReglaDeNegocioViolada;

/** Recorrido sin Spring: el dominio funciona solo. Ejecuta: java -cp target/classes academia.ddd.app.DemoDdd */
public final class DemoDdd {

    public static void main(String[] args) {
        Pedido pedido = new Pedido("P-100", "CL-7");
        pedido.agregar("CAFE-HUILA-500G", 3, new Dinero(32_000));
        pedido.agregar("TAZA-BARRO", 4, new Dinero(18_500));
        System.out.println("Total: " + pedido.total().pesos() + " COP en " + pedido.unidades() + " unidades");

        pedido.confirmar("Cra 7 # 40-62, Bogotá");
        var eventos = pedido.extraerEventos();
        System.out.println("Eventos: " + eventos);

        var envios = new PlanificadorDeEnvios();
        for (Object evento : eventos) {
            if (evento instanceof PedidoConfirmado confirmado) {
                System.out.println("Envíos creó: " + envios.alConfirmarsePedido(confirmado));
            }
        }
        try {
            pedido.agregar("FILTRO", 1, new Dinero(9_000));
        } catch (ReglaDeNegocioViolada e) {
            System.out.println("Rechazado: " + e.getMessage());
        }
    }
}
