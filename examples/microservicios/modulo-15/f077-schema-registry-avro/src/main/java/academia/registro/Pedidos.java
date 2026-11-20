package academia.registro;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

import academia.avro.Pedido;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/** Productor y consumidor tipados con la clase GENERADA desde pedido.avsc. */
@Component
public class Pedidos {

    private final KafkaTemplate<String, Pedido> kafka;
    final BlockingQueue<Pedido> recibidos = new LinkedBlockingQueue<>();

    Pedidos(KafkaTemplate<String, Pedido> kafka) {
        this.kafka = kafka;
    }

    public void publicar(Pedido pedido) throws Exception {
        kafka.send(Topicos.PEDIDOS, pedido.getId(), pedido).get(10, TimeUnit.SECONDS);
    }

    @KafkaListener(id = "facturacion-avro", groupId = "facturacion-avro", topics = Topicos.PEDIDOS)
    void alRecibir(Pedido pedido) {
        recibidos.add(pedido);
    }
}
