package academia.eos;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.KafkaTemplate;

/** Requiere el Kafka 4.4.0 del docker-compose.yml del módulo (con el log de transacciones con RF 1). */
@SpringBootTest
class ExactlyOnceTest {

    @Autowired KafkaTemplate<String, String> kafka;
    @Value("${spring.kafka.bootstrap-servers}") String bootstrap;

    /** Lee TODO pagos-validados con el nivel de aislamiento indicado y devuelve los valores de esa clave. */
    List<String> leerSalida(String clave, String aislamiento, int esperados) {
        Map<String, Object> config = Map.of(
                ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrap,
                ConsumerConfig.GROUP_ID_CONFIG, "lector-" + UUID.randomUUID(),
                ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest",
                ConsumerConfig.ISOLATION_LEVEL_CONFIG, aislamiento,
                ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class,
                ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        List<String> valores = new ArrayList<>();
        try (var consumidor = new KafkaConsumer<String, String>(config)) {
            consumidor.subscribe(List.of(Topicos.VALIDADOS));
            long limite = System.currentTimeMillis() + 30_000;
            while (System.currentTimeMillis() < limite && valores.size() < esperados) {
                for (ConsumerRecord<String, String> r : consumidor.poll(Duration.ofMillis(500))) {
                    if (r.key().equals(clave)) {
                        valores.add(r.value());
                    }
                }
            }
            // un poco más de tiempo por si aparece algún duplicado
            for (ConsumerRecord<String, String> r : consumidor.poll(Duration.ofSeconds(2))) {
                if (r.key().equals(clave)) {
                    valores.add(r.value());
                }
            }
        }
        return valores;
    }

    @Test
    void unaCaidaTrasEscribirNoDuplicaLaSalidaParaUnLectorReadCommitted() {
        String clave = "pago-" + UUID.randomUUID().toString().substring(0, 8);
        // Con un productor transaccional, publicar fuera de una transacción falla: se abre una a mano.
        kafka.executeInTransaction(t -> t.send(Topicos.PAGOS, clave, clave + "-caida"));

        List<String> confirmados = leerSalida(clave, "read_committed", 1);
        List<String> todos = leerSalida(clave, "read_uncommitted", 2);

        System.out.println("read_committed   -> " + confirmados);
        System.out.println("read_uncommitted -> " + todos);
        // El lector transaccional ve el resultado UNA vez...
        assertThat(confirmados).containsExactly("VALIDADO:" + clave + "-caida");
        // ...aunque en el log hay DOS escrituras: la del intento abortado y la del reintento confirmado.
        assertThat(todos).hasSize(2);
    }

    @Test
    void unPagoNormalSaleUnaSolaVez() {
        String clave = "pago-" + UUID.randomUUID().toString().substring(0, 8);
        kafka.executeInTransaction(t -> t.send(Topicos.PAGOS, clave, clave + "-normal"));
        assertThat(leerSalida(clave, "read_committed", 1)).containsExactly("VALIDADO:" + clave + "-normal");
        assertThat(leerSalida(clave, "read_uncommitted", 1)).hasSize(1);
    }
}
