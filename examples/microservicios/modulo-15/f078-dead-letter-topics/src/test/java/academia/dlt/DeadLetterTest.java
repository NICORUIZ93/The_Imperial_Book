package academia.dlt;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.header.Header;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;

/** Requiere el Kafka 4.4.0 del docker-compose.yml del módulo. */
@SpringBootTest
class DeadLetterTest {

    @Autowired KafkaTemplate<String, String> kafka;
    @Autowired ProcesadorDeCobros procesador;
    @Value("${spring.kafka.bootstrap-servers}") String bootstrap;

    final String corrida = UUID.randomUUID().toString().substring(0, 8);

    Map<String, ConsumerRecord<String, String>> leerDlt(int esperados) {
        Map<String, Object> config = Map.of(
                ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrap,
                ConsumerConfig.GROUP_ID_CONFIG, "revisor-dlt-" + corrida,
                ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest",
                ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class,
                ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        Map<String, ConsumerRecord<String, String>> enDlt = new HashMap<>();
        try (var consumidor = new KafkaConsumer<String, String>(config)) {
            consumidor.subscribe(List.of(ManejoDeErrores.COBROS_DLT));
            long limite = System.currentTimeMillis() + 30_000;
            while (System.currentTimeMillis() < limite && enDlt.size() < esperados) {
                for (ConsumerRecord<String, String> r : consumidor.poll(Duration.ofMillis(500))) {
                    if (r.key().endsWith(corrida)) {
                        enDlt.put(r.key(), r);
                    }
                }
            }
            for (ConsumerRecord<String, String> r : consumidor.poll(Duration.ofSeconds(3))) {
                if (r.key().endsWith(corrida)) {
                    enDlt.put(r.key(), r);
                }
            }
        }
        return enDlt;
    }

    static String cabecera(ConsumerRecord<?, ?> r, String nombre) {
        Header h = r.headers().lastHeader(nombre);
        return h == null ? null : new String(h.value(), StandardCharsets.UTF_8);
    }

    @Test
    void loInvalidoVaAlDltSinReintentosYLoTransitorioSeRecupera() throws Exception {
        String ok = "C1-" + corrida, invalido = "C2-" + corrida, lento = "C3-" + corrida;
        kafka.send(ManejoDeErrores.COBROS, ok, "monto=100").get(10, TimeUnit.SECONDS);
        kafka.send(ManejoDeErrores.COBROS, invalido, "monto=-5").get(10, TimeUnit.SECONDS);
        kafka.send(ManejoDeErrores.COBROS, lento, "monto=70;pasarela-lenta").get(10, TimeUnit.SECONDS);

        Map<String, ConsumerRecord<String, String>> enDlt = leerDlt(1);

        // Solo el inválido está en el DLT, con la información para diagnosticarlo.
        assertThat(enDlt).containsOnlyKeys(invalido);
        ConsumerRecord<String, String> muerto = enDlt.get(invalido);
        assertThat(muerto.value()).isEqualTo("monto=-5");
        assertThat(cabecera(muerto, KafkaHeaders.DLT_ORIGINAL_TOPIC)).isEqualTo("cobros");
        assertThat(cabecera(muerto, KafkaHeaders.DLT_EXCEPTION_MESSAGE)).contains("Monto negativo");
        System.out.println("DLT -> " + muerto.key() + " particion=" + muerto.partition()
                + " origen=" + cabecera(muerto, KafkaHeaders.DLT_ORIGINAL_TOPIC)
                + " causa=" + cabecera(muerto, KafkaHeaders.DLT_EXCEPTION_CAUSE_FQCN));

        long limite = System.currentTimeMillis() + 20_000;
        while (!procesador.cobrados.contains(lento) && System.currentTimeMillis() < limite) {
            Thread.sleep(200);
        }
        // El inválido se intentó 1 vez (no reintentable); el lento, 3 veces y al final se cobró.
        assertThat(procesador.intentos.get(invalido).get()).isEqualTo(1);
        assertThat(procesador.intentos.get(lento).get()).isEqualTo(3);
        assertThat(procesador.cobrados).contains(ok, lento).doesNotContain(invalido);
    }
}
