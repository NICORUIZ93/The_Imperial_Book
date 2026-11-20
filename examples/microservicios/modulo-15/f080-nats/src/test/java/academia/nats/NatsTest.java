package academia.nats;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import io.nats.client.Connection;
import io.nats.client.ConsumerContext;
import io.nats.client.Dispatcher;
import io.nats.client.JetStream;
import io.nats.client.Message;
import io.nats.client.api.ConsumerConfiguration;
import io.nats.client.api.DeliverPolicy;
import io.nats.client.api.PublishAck;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

/** Requiere el NATS 2.15.3 (con -js) del docker-compose.yml del módulo: docker compose up -d --wait nats */
@SpringBootTest
class NatsTest {

    @Autowired Connection nats;
    @Autowired Suscriptores suscriptores;

    static byte[] b(String s) {
        return s.getBytes(StandardCharsets.UTF_8);
    }

    @Test
    void requestReplyRepartidoEntreLasInstanciasDelQueueGroup() throws Exception {
        Message respuesta = nats.request("inventario.stock", b("SKU-1"), Duration.ofSeconds(2));
        assertThat(new String(respuesta.getData(), StandardCharsets.UTF_8)).startsWith("SKU-1=7 (instancia-");
        for (int i = 0; i < 19; i++) {
            assertThat(nats.request("inventario.stock", b("SKU-" + i), Duration.ofSeconds(2))).isNotNull();
        }
        int a = suscriptores.de("instancia-A"), bb = suscriptores.de("instancia-B");
        System.out.println("Reparto del queue group: instancia-A=" + a + " instancia-B=" + bb);
        assertThat(a + bb).isGreaterThanOrEqualTo(20);   // cada petición la atiende UNA sola instancia
        assertThat(a).isPositive();
        assertThat(bb).isPositive();
    }

    @Test
    void fanOutParaLosSuscriptoresNormalesYRepartoEnElQueueGroup() throws Exception {
        int correo = suscriptores.de("correo"), push = suscriptores.de("push");
        int fact = suscriptores.de("facturacion-1") + suscriptores.de("facturacion-2");
        for (int i = 0; i < 10; i++) {
            nats.publish("avisos.pedido-creado", b("P-" + i));
        }
        nats.flush(Duration.ofSeconds(2));
        Thread.sleep(500);
        assertThat(suscriptores.de("correo") - correo).isEqualTo(10);
        assertThat(suscriptores.de("push") - push).isEqualTo(10);
        assertThat(suscriptores.de("facturacion-1") + suscriptores.de("facturacion-2") - fact).isEqualTo(10);
    }

    @Test
    void sinRespondedoresLaPeticionDevuelveNullAlInstante() throws Exception {
        long inicio = System.nanoTime();
        Message respuesta = nats.request("nadie.escucha", b("?"), Duration.ofSeconds(2));
        long ms = (System.nanoTime() - inicio) / 1_000_000;
        System.out.println("Sin respondedores: respuesta=" + respuesta + " en " + ms + " ms");
        assertThat(respuesta).isNull();
        assertThat(ms).isLessThan(1000);                 // el servidor avisa (estado 503): no espera los 2 s
    }

    @Test
    void coreNoGuardaNadaPeroJetStreamSi() throws Exception {
        String corrida = UUID.randomUUID().toString().substring(0, 8);
        // NATS core: publicar sin nadie suscrito = el mensaje se pierde.
        nats.publish("avisos.tarde." + corrida, b("antes"));
        nats.flush(Duration.ofSeconds(1));
        AtomicInteger tarde = new AtomicInteger();
        Dispatcher d = nats.createDispatcher(m -> tarde.incrementAndGet());
        d.subscribe("avisos.tarde." + corrida);
        Thread.sleep(500);
        assertThat(tarde.get()).isZero();

        // JetStream: el stream guarda; un consumidor DURABLE creado después lo lee desde el principio.
        JetStream js = nats.jetStream();
        List<Long> secuencias = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            PublishAck ack = js.publish("pagos." + corrida, b("pago-" + i));
            assertThat(ack.getStream()).isEqualTo(NatsConfig.STREAM);
            secuencias.add(ack.getSeqno());
        }
        ConsumerContext consumidor = nats.getStreamContext(NatsConfig.STREAM).createOrUpdateConsumer(
                ConsumerConfiguration.builder()
                        .durable("facturacion-" + corrida)
                        .filterSubject("pagos." + corrida)
                        .deliverPolicy(DeliverPolicy.All)
                        .build());
        List<String> leidos = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            Message m = consumidor.next(Duration.ofSeconds(2));
            leidos.add(new String(m.getData(), StandardCharsets.UTF_8));
            m.ack();                                     // sin ack, JetStream lo reentrega tras ack_wait (30 s)
        }
        System.out.println("JetStream secuencias=" + secuencias + " leídos=" + leidos);
        assertThat(leidos).containsExactly("pago-0", "pago-1", "pago-2");
    }
}
