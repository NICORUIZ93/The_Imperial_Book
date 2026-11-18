package academia.rutaflow.event;

import java.util.concurrent.CompletableFuture;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

@Service
public class EnvioEventPublisher {
    public static final String TOPIC = "rutaflow.envio.creado";
    private final KafkaTemplate<String, EnvioCreado> kafka;

    public EnvioEventPublisher(KafkaTemplate<String, EnvioCreado> kafka) {
        this.kafka = kafka;
    }

    public CompletableFuture<SendResult<String, EnvioCreado>> publicar(EnvioCreado evento) {
        return kafka.send(TOPIC, evento.envioId().toString(), evento);
    }
}
