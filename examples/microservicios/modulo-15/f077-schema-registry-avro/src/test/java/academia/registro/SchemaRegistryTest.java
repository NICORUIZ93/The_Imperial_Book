package academia.registro;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import academia.avro.Pedido;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.serialization.ByteArrayDeserializer;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

/** Requiere Kafka 4.4.0 y Schema Registry 8.4.1 del docker-compose.yml: docker compose up -d --wait kafka schema-registry */
@SpringBootTest
class SchemaRegistryTest {

    static final String SUBJECT = "pedidos-avro-value";

    @Autowired Pedidos pedidos;
    @Value("${spring.kafka.bootstrap-servers}") String bootstrap;
    @Value("${spring.kafka.producer.properties.schema.registry.url}") String registro;

    final HttpClient http = HttpClient.newHttpClient();

    String get(String ruta) throws Exception {
        return http.send(HttpRequest.newBuilder(URI.create(registro + ruta)).build(),
                HttpResponse.BodyHandlers.ofString()).body();
    }

    String compatibilidad(String recurso) throws Exception {
        String esquema = new String(getClass().getResourceAsStream(recurso).readAllBytes(), StandardCharsets.UTF_8).trim();
        String cuerpo = "{\"schema\":\"" + esquema.replace("\"", "\\\"") + "\"}";
        var peticion = HttpRequest.newBuilder(URI.create(registro + "/compatibility/subjects/" + SUBJECT + "/versions/latest"))
                .header("Content-Type", "application/vnd.schemaregistry.v1+json")
                .POST(HttpRequest.BodyPublishers.ofString(cuerpo))
                .build();
        // sin espacios: {"is_compatible": true} y {"is_compatible":true} cuentan igual
        return http.send(peticion, HttpResponse.BodyHandlers.ofString()).body().replace(" ", "");
    }

    @Test
    void elPedidoViajaEnAvroYElEsquemaQuedaRegistrado() throws Exception {
        String id = "P-" + UUID.randomUUID().toString().substring(0, 8);
        pedidos.publicar(Pedido.newBuilder().setId(id).setCliente("ana").setTotalCentavos(125000L).build());

        Pedido recibido;
        do {
            recibido = pedidos.recibidos.poll(30, TimeUnit.SECONDS);
        } while (recibido != null && !recibido.getId().equals(id));
        assertThat(recibido).isNotNull();
        assertThat(recibido.getTotalCentavos()).isEqualTo(125000L);
        assertThat(get("/subjects")).contains(SUBJECT);
    }

    @Test
    void cadaMensajeEmpiezaConElByteMagicoYElIdDelEsquema() throws Exception {
        String id = "P-" + UUID.randomUUID().toString().substring(0, 8);
        pedidos.publicar(Pedido.newBuilder().setId(id).setCliente("beto").setTotalCentavos(990L).build());
        String ultima = get("/subjects/" + SUBJECT + "/versions/latest");
        int idEsquema = Integer.parseInt(ultima.replace(" ", "").replaceAll(".*\"id\":(\\d+).*", "$1"));

        Map<String, Object> config = Map.of(
                ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrap,
                ConsumerConfig.GROUP_ID_CONFIG, "bytes-" + UUID.randomUUID(),
                ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest",
                ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class,
                ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ByteArrayDeserializer.class);
        byte[] valor = null;
        try (var consumidor = new KafkaConsumer<String, byte[]>(config)) {
            consumidor.subscribe(List.of(Topicos.PEDIDOS));
            long limite = System.currentTimeMillis() + 30_000;
            while (valor == null && System.currentTimeMillis() < limite) {
                for (ConsumerRecord<String, byte[]> r : consumidor.poll(Duration.ofMillis(500))) {
                    if (r.key().equals(id)) {
                        valor = r.value();
                    }
                }
            }
        }
        assertThat(valor).isNotNull();
        ByteBuffer buffer = ByteBuffer.wrap(valor);
        assertThat(buffer.get()).isEqualTo((byte) 0);          // byte mágico del formato de Confluent
        assertThat(buffer.getInt()).isEqualTo(idEsquema);       // 4 bytes big-endian: id del esquema
        System.out.println("Esquema " + idEsquema + " · " + valor.length + " bytes en el topic (5 de cabecera)");
    }

    @Test
    void elRegistroAceptaUnCampoNuevoConDefaultYRechazaUnoSinDefault() throws Exception {
        pedidos.publicar(Pedido.newBuilder().setId("P-compat").setCliente("ana").setTotalCentavos(1L).build());
        assertThat(get("/config")).contains("BACKWARD");
        assertThat(compatibilidad("/pedido-v2-compatible.avsc")).contains("\"is_compatible\":true");
        assertThat(compatibilidad("/pedido-v2-incompatible.avsc")).contains("\"is_compatible\":false");
    }
}
