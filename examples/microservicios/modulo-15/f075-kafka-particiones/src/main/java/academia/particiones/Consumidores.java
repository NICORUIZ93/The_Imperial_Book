package academia.particiones;

import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Dos consumer groups sobre el MISMO topic:
 *  - «inventario» con concurrency=3: tres KafkaConsumer en el mismo grupo se REPARTEN las 3 particiones.
 *  - «auditoria» con un solo consumidor: recibe TODOS los registros (cada grupo tiene sus propios offsets).
 */
@Component
public class Consumidores {

    private static final Logger log = LoggerFactory.getLogger(Consumidores.class);

    final Queue<Recepcion> inventario = new ConcurrentLinkedQueue<>();
    final Queue<Recepcion> auditoria = new ConcurrentLinkedQueue<>();

    @KafkaListener(id = "inventario", groupId = "inventario", topics = Topicos.PEDIDOS, concurrency = "3")
    void inventario(ConsumerRecord<String, String> r) {
        inventario.add(recepcion("inventario", r));
        log.info("inventario hilo={} particion={} offset={} clave={}",
                Thread.currentThread().getName(), r.partition(), r.offset(), r.key());
    }

    @KafkaListener(id = "auditoria", groupId = "auditoria", topics = Topicos.PEDIDOS)
    void auditoria(ConsumerRecord<String, String> r) {
        auditoria.add(recepcion("auditoria", r));
    }

    private static Recepcion recepcion(String grupo, ConsumerRecord<String, String> r) {
        return new Recepcion(grupo, Thread.currentThread().getName(), r.partition(), r.key(), r.value());
    }
}
