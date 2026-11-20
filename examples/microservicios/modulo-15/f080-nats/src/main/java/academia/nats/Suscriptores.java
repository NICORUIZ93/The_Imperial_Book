package academia.nats;

import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import io.nats.client.Connection;
import io.nats.client.Dispatcher;
import org.springframework.stereotype.Component;

/**
 * NATS core (sin persistencia, «at-most-once»):
 *  - inventario.stock: request-reply con DOS respondedores en el queue group «inventario» (se reparten).
 *  - avisos.pedido-creado: «correo» y «push» reciben TODO (fan-out); «facturacion-1» y «facturacion-2»
 *    están en el queue group «facturacion» y se REPARTEN los mensajes.
 */
@Component
public class Suscriptores {

    final Map<String, AtomicInteger> recibidos = new ConcurrentHashMap<>();

    Suscriptores(Connection nats) {
        Dispatcher dispatcher = nats.createDispatcher();
        for (String instancia : new String[] {"instancia-A", "instancia-B"}) {
            dispatcher.subscribe("inventario.stock", "inventario", msg -> {
                contar(instancia);
                String sku = new String(msg.getData(), StandardCharsets.UTF_8);
                nats.publish(msg.getReplyTo(), (sku + "=7 (" + instancia + ")").getBytes(StandardCharsets.UTF_8));
            });
        }
        dispatcher.subscribe("avisos.pedido-creado", msg -> contar("correo"));
        dispatcher.subscribe("avisos.pedido-creado", msg -> contar("push"));
        dispatcher.subscribe("avisos.pedido-creado", "facturacion", msg -> contar("facturacion-1"));
        dispatcher.subscribe("avisos.pedido-creado", "facturacion", msg -> contar("facturacion-2"));
    }

    private void contar(String quien) {
        recibidos.computeIfAbsent(quien, k -> new AtomicInteger()).incrementAndGet();
    }

    int de(String quien) {
        AtomicInteger n = recibidos.get(quien);
        return n == null ? 0 : n.get();
    }
}
