package academia.decision;

import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/** Un servicio lento (300 ms), por ejemplo un proveedor de correo. */
@Component
public class Notificador {

    // Privado y leído con un método: Spring envuelve este bean en un proxy CGLIB por @Async, y los campos del
    // proxy no se inicializan (un test que lea notificador.enviados vería null). Los métodos sí se delegan.
    private final AtomicInteger enviados = new AtomicInteger();

    public record PedidoCreado(String id) {
    }

    public int enviados() {
        return enviados.get();
    }

    /** Llamada directa (síncrona): quien llama espera los 300 ms. */
    public void notificar(String pedidoId) {
        dormir(300);
        enviados.incrementAndGet();
    }

    /** Reacción a un evento en otro hilo (asíncrona): quien publica no espera. */
    @Async
    @EventListener
    public void alCrearsePedido(PedidoCreado evento) {
        notificar(evento.id());
    }

    private static void dormir(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
