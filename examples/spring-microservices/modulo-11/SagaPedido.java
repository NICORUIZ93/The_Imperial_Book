import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SagaPedido {

    /** Un paso de la saga: una transacción local y la acción que la compensa. */
    record Paso(String nombre, Runnable accion, Runnable compensacion) {}

    static class Pedidos {
        final Map<String, String> estado = new HashMap<>();
        void crear(String id)    { estado.put(id, "PENDIENTE"); }
        void confirmar(String id) { estado.put(id, "CONFIRMADO"); }
        void cancelar(String id)  { estado.put(id, "CANCELADO"); }
    }

    static class Inventario {
        private final Map<String, Integer> stock = new HashMap<>(Map.of("TEC-1042", 5));
        private final Map<String, String> reservas = new HashMap<>();

        void reservar(String pedido, String sku) {
            int disponible = stock.get(sku);
            if (disponible == 0) throw new IllegalStateException("sin stock de " + sku);
            stock.put(sku, disponible - 1);
            reservas.put(pedido, sku);
        }

        /** Idempotente: liberar dos veces la misma reserva devuelve una sola unidad. */
        void liberar(String pedido) {
            String sku = reservas.remove(pedido);
            if (sku != null) stock.merge(sku, 1, Integer::sum);
        }

        int disponible(String sku) { return stock.get(sku); }
    }

    static class Pagos {
        private final boolean tarjetaRechazada;
        Pagos(boolean tarjetaRechazada) { this.tarjetaRechazada = tarjetaRechazada; }
        void cobrar(String pedido) {
            if (tarjetaRechazada) throw new IllegalStateException("pago rechazado");
        }
        void reembolsar(String pedido) { }
    }

    static class Orquestador {
        final List<String> registro = new ArrayList<>();

        boolean ejecutar(List<Paso> pasos) {
            Deque<Paso> hechos = new ArrayDeque<>();
            for (Paso paso : pasos) {
                try {
                    paso.accion().run();
                    hechos.push(paso);
                    registro.add("ok          " + paso.nombre());
                } catch (RuntimeException e) {
                    registro.add("falla       " + paso.nombre() + " (" + e.getMessage() + ")");
                    while (!hechos.isEmpty()) {           // orden inverso
                        Paso hecho = hechos.pop();
                        hecho.compensacion().run();
                        registro.add("compensado  " + hecho.nombre());
                    }
                    return false;
                }
            }
            return true;
        }
    }

    static void comprar(String pedido, boolean tarjetaRechazada) {
        var pedidos = new Pedidos();
        var inventario = new Inventario();
        var pagos = new Pagos(tarjetaRechazada);
        var saga = new Orquestador();

        boolean exito = saga.ejecutar(List.of(
            new Paso("crear pedido",   () -> pedidos.crear(pedido),                  () -> pedidos.cancelar(pedido)),
            new Paso("reservar stock", () -> inventario.reservar(pedido, "TEC-1042"), () -> inventario.liberar(pedido)),
            new Paso("cobrar pago",    () -> pagos.cobrar(pedido),                   () -> pagos.reembolsar(pedido))
        ));
        if (exito) pedidos.confirmar(pedido);

        System.out.println("== " + pedido + (tarjetaRechazada ? " (tarjeta rechazada)" : ""));
        saga.registro.forEach(linea -> System.out.println("  " + linea));
        System.out.println("  pedido: " + pedidos.estado.get(pedido)
                + " | stock TEC-1042: " + inventario.disponible("TEC-1042"));

        if (!exito) {
            inventario.liberar(pedido);   // llega un reintento duplicado de la compensación
            System.out.println("  compensación repetida, stock: " + inventario.disponible("TEC-1042"));
        }
    }

    public static void main(String[] args) {
        comprar("P-1", false);
        comprar("P-2", true);
    }
}
