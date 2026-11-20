package academia.rabbit;

import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicInteger;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.AmqpRejectAndDontRequeueException;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class ProcesadorDePedidos {

    private static final Logger log = LoggerFactory.getLogger(ProcesadorDePedidos.class);

    final Map<String, AtomicInteger> intentos = new ConcurrentHashMap<>();
    final Queue<String> procesados = new ConcurrentLinkedQueue<>();

    @RabbitListener(queues = Topologia.COLA)
    void procesar(String pedido) {
        int intento = intentos.computeIfAbsent(pedido, k -> new AtomicInteger()).incrementAndGet();
        log.info("pedido {} intento {}", pedido, intento);
        if (pedido.startsWith("invalido")) {
            // Permanente: rechazo SIN reencolar -> el broker lo manda al DLX en el acto.
            throw new AmqpRejectAndDontRequeueException("Pedido mal formado: " + pedido);
        }
        if (pedido.startsWith("siempre-falla")) {
            // Cualquier otra excepción: Spring rechaza CON reencolado (basic.reject requeue=true).
            // La quorum queue cuenta la entrega fallida y, al superar delivery-limit, lo manda al DLX.
            throw new IllegalStateException("Inventario caído procesando " + pedido);
        }
        procesados.add(pedido);
    }
}
