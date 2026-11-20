package academia.mensajeria;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/** El consumidor (Facturación) recibe cuando puede; si está caído, el broker guarda los mensajes. */
@Component
public class Facturacion {

    private static final Logger log = LoggerFactory.getLogger(Facturacion.class);
    final BlockingQueue<String> desdeRabbit = new LinkedBlockingQueue<>();
    final BlockingQueue<String> desdeKafka = new LinkedBlockingQueue<>();

    @RabbitListener(queues = Topologia.COLA_FACTURACION)
    void alRecibirDeRabbit(String mensaje) {
        log.info("RabbitMQ -> {}", mensaje);
        desdeRabbit.add(mensaje);
    }

    @KafkaListener(topics = Topologia.TOPIC)
    void alRecibirDeKafka(ConsumerRecord<String, String> registro) {
        log.info("Kafka -> {} (partición {}, offset {})", registro.value(), registro.partition(), registro.offset());
        desdeKafka.add(registro.value());
    }
}
