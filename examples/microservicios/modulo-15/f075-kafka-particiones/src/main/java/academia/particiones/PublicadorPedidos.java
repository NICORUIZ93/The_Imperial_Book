package academia.particiones;

import java.util.concurrent.TimeUnit;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class PublicadorPedidos {

    private final KafkaTemplate<String, String> kafka;

    PublicadorPedidos(KafkaTemplate<String, String> kafka) {
        this.kafka = kafka;
    }

    /**
     * La CLAVE decide la partición: murmur2(clave) % particiones. Mismo cliente = misma partición = orden garantizado.
     * get(...) espera el acuse del broker y devuelve en qué partición y offset quedó el registro.
     */
    public int publicar(String clienteId, String pedido) throws Exception {
        var resultado = kafka.send(Topicos.PEDIDOS, clienteId, pedido).get(10, TimeUnit.SECONDS);
        return resultado.getRecordMetadata().partition();
    }
}
