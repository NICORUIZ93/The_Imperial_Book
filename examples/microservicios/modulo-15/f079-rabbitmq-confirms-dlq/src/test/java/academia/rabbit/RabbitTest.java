package academia.rabbit;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

/** Requiere el RabbitMQ 4.4.1 del docker-compose.yml del módulo: docker compose up -d --wait rabbitmq */
@SpringBootTest
class RabbitTest {

    @Autowired Publicador publicador;
    @Autowired ProcesadorDePedidos procesador;
    @Autowired RabbitTemplate rabbit;

    final String corrida = UUID.randomUUID().toString().substring(0, 8);

    /** Busca en la DLQ el mensaje con ese cuerpo (puede haber restos de ejecuciones anteriores). */
    Message buscarEnDlq(String cuerpo) {
        long limite = System.currentTimeMillis() + 20_000;
        while (System.currentTimeMillis() < limite) {
            Message m = rabbit.receive(Topologia.DLQ, 1000);
            if (m != null && new String(m.getBody(), StandardCharsets.UTF_8).equals(cuerpo)) {
                return m;
            }
        }
        return null;
    }

    @Test
    void unMensajeEnrutableRecibeAckYSeProcesa() throws Exception {
        var r = publicador.publicar(Topologia.RUTA, "ok-" + corrida);
        assertThat(r.ack()).isTrue();
        assertThat(r.devuelto()).isNull();
        long limite = System.currentTimeMillis() + 10_000;
        while (!procesador.procesados.contains("ok-" + corrida) && System.currentTimeMillis() < limite) {
            Thread.sleep(100);
        }
        assertThat(procesador.procesados).contains("ok-" + corrida);
    }

    @Test
    void unMensajeSinRutaSeDevuelveConNoRoute() throws Exception {
        var r = publicador.publicar("ruta.que.no.existe", "perdido-" + corrida);
        // El broker CONFIRMA (ack) incluso un mensaje que no llegó a ninguna cola: el ack no basta.
        assertThat(r.ack()).isTrue();
        assertThat(r.devuelto()).isNotNull();
        assertThat(r.devuelto().getReplyCode()).isEqualTo(312);
        assertThat(r.devuelto().getReplyText()).isEqualTo("NO_ROUTE");
        System.out.println("Devuelto: " + r.devuelto().getReplyCode() + " " + r.devuelto().getReplyText());
    }

    @Test
    void unMensajeInvalidoVaALaDlqConLaRazonRejected() throws Exception {
        String cuerpo = "invalido-" + corrida;
        assertThat(publicador.publicar(Topologia.RUTA, cuerpo).ack()).isTrue();
        Message muerto = buscarEnDlq(cuerpo);
        assertThat(muerto).isNotNull();
        List<Map<String, ?>> xDeath = muerto.getMessageProperties().getXDeathHeader();
        assertThat(xDeath.get(0).get("reason")).hasToString("rejected");
        assertThat(xDeath.get(0).get("queue")).hasToString("pedidos");
        assertThat(procesador.intentos.get(cuerpo).get()).isEqualTo(1);
    }

    @Test
    void unMensajeQueSiempreFallaAgotaElDeliveryLimit() throws Exception {
        String cuerpo = "siempre-falla-" + corrida;
        publicador.publicar(Topologia.RUTA, cuerpo);
        Message muerto = buscarEnDlq(cuerpo);
        assertThat(muerto).isNotNull();
        assertThat(muerto.getMessageProperties().getXDeathHeader().get(0).get("reason")).hasToString("delivery_limit");
        // delivery-limit=3: 1 entrega + 3 reentregas fallidas = 4 intentos (comprobado con basic.reject)
        assertThat(procesador.intentos.get(cuerpo).get()).isEqualTo(4);
        System.out.println(cuerpo + " -> DLQ tras " + procesador.intentos.get(cuerpo) + " intentos");
    }
}
