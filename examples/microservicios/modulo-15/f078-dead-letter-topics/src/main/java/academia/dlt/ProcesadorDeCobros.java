package academia.dlt;

import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicInteger;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class ProcesadorDeCobros {

    private static final Logger log = LoggerFactory.getLogger(ProcesadorDeCobros.class);

    final Map<String, AtomicInteger> intentos = new ConcurrentHashMap<>();
    final Queue<String> cobrados = new ConcurrentLinkedQueue<>();

    @KafkaListener(id = "cobros", groupId = "cobros", topics = ManejoDeErrores.COBROS)
    void cobrar(ConsumerRecord<String, String> r) {
        int intento = intentos.computeIfAbsent(r.key(), k -> new AtomicInteger()).incrementAndGet();
        log.info("cobro {} intento {} valor={}", r.key(), intento, r.value());
        if (r.value().startsWith("monto=-")) {
            throw new DatosInvalidos("Monto negativo en " + r.key());           // permanente
        }
        if (r.value().contains("pasarela-lenta") && intento < 3) {
            throw new IllegalStateException("Pasarela no responde (intento " + intento + ")"); // transitorio
        }
        cobrados.add(r.key());
    }
}
