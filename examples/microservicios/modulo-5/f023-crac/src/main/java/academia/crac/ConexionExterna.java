package academia.crac;

import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.context.SmartLifecycle;
import org.springframework.stereotype.Component;

/**
 * Representa un recurso que NO puede viajar dentro de un checkpoint
 * (socket, archivo abierto, conexión a BD). Spring llama a stop() antes del
 * checkpoint y a start() después del restore.
 */
@Component
public class ConexionExterna implements SmartLifecycle {

    private final AtomicInteger aperturas = new AtomicInteger();
    private volatile boolean abierta;

    @Override
    public void start() {
        abierta = true;
        System.out.println("Conexión abierta (apertura #" + aperturas.incrementAndGet() + ")");
    }

    @Override
    public void stop() {
        abierta = false;
        System.out.println("Conexión cerrada antes del checkpoint");
    }

    @Override
    public boolean isRunning() { return abierta; }

    public int aperturas() { return aperturas.get(); }
}
