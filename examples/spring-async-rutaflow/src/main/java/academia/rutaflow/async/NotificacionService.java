package academia.rutaflow.async;

import java.util.concurrent.CompletableFuture;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class NotificacionService {
    @Async("notificaciones")
    public CompletableFuture<String> enviar(String guia) {
        if (guia.isBlank()) throw new IllegalArgumentException("Guía vacía");
        // Solo simula la respuesta; no contacta un proveedor SMS.
        return CompletableFuture.completedFuture(Thread.currentThread().getName());
    }

    public CompletableFuture<String> enviarDesdeDentro(String guia) {
        return this.enviar(guia);
    }
}
