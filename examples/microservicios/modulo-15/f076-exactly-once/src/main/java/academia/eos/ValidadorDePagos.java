package academia.eos;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Consume-procesa-produce. El contenedor abre la transacción ANTES de llamar al método; el send() de aquí se une a
 * ella; si el método termina bien, el contenedor añade el offset leído (sendOffsetsToTransaction) y confirma.
 * Si lanza una excepción, ABORTA: el registro escrito queda marcado como abortado y el offset no avanza.
 */
@Component
public class ValidadorDePagos {

    private static final Logger log = LoggerFactory.getLogger(ValidadorDePagos.class);

    private final KafkaTemplate<String, String> kafka;
    /** Pagos que ya «se cayeron» una vez (para simular la caída solo en el primer intento). */
    private final Set<String> yaFallaron = ConcurrentHashMap.newKeySet();

    ValidadorDePagos(KafkaTemplate<String, String> kafka) {
        this.kafka = kafka;
    }

    @KafkaListener(id = "validador", groupId = "validador", topics = Topicos.PAGOS)
    void validar(ConsumerRecord<String, String> pago) {
        kafka.send(Topicos.VALIDADOS, pago.key(), "VALIDADO:" + pago.value());
        log.info("enviado VALIDADO:{} (transacción abierta)", pago.value());
        if (pago.value().contains("caida") && yaFallaron.add(pago.key())) {
            // Caída DESPUÉS de escribir la salida y ANTES de confirmar: el caso que rompe «at-least-once».
            throw new IllegalStateException("Caída simulada procesando " + pago.key());
        }
    }
}
