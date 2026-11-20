package academia.mensajeria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

/** Requiere RabbitMQ y Kafka del docker-compose.yml del módulo: docker compose up -d --wait */
@SpringBootTest
class MensajeriaTest {

    @Autowired
    Publicador publicador;

    @Autowired
    Facturacion facturacion;

    @Test
    void rabbitEntregaElMensajeALaColaDeFacturacion() throws Exception {
        publicador.porRabbit("R-1");
        assertThat(facturacion.desdeRabbit.poll(10, TimeUnit.SECONDS)).isEqualTo("PedidoCreado:R-1");
    }

    @Test
    void kafkaEntregaElMensajeAlGrupoDeFacturacion() throws Exception {
        publicador.porKafka("K-1");
        // El listener puede recibir antes mensajes de ejecuciones anteriores (el log de Kafka se conserva).
        String recibido;
        do {
            recibido = facturacion.desdeKafka.poll(30, TimeUnit.SECONDS);
        } while (recibido != null && !recibido.equals("PedidoCreado:K-1"));
        assertThat(recibido).isEqualTo("PedidoCreado:K-1");
    }

    @Test
    void laMismaClaveSiempreVaALaMismaParticion() throws Exception {
        int primera = publicador.porKafka("CLIENTE-7");
        int segunda = publicador.porKafka("CLIENTE-7");
        assertThat(segunda).isEqualTo(primera);
    }
}
