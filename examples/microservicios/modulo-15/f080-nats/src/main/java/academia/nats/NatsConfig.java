package academia.nats;

import java.time.Duration;

import io.nats.client.Connection;
import io.nats.client.JetStreamManagement;
import io.nats.client.Nats;
import io.nats.client.Options;
import io.nats.client.api.StorageType;
import io.nats.client.api.StreamConfiguration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class NatsConfig {

    static final String STREAM = "PAGOS";

    /** Una conexión por aplicación (es thread-safe). Spring la cierra al apagar (close drena y desconecta). */
    @Bean(destroyMethod = "close")
    Connection nats(@Value("${nats.url}") String url) throws Exception {
        Options opciones = new Options.Builder()
                .server(url)
                .connectionName("f080-inventario")
                .connectionTimeout(Duration.ofSeconds(5))
                .maxReconnects(-1)                       // reintenta para siempre si el servidor se cae
                .build();
        return Nats.connect(opciones);
    }

    /** JetStream: un STREAM guarda todo lo publicado en pagos.> (aquí en memoria; en producción, en disco). */
    @Bean
    StreamConfiguration streamPagos(Connection nats) throws Exception {
        StreamConfiguration config = StreamConfiguration.builder()
                .name(STREAM)
                .subjects("pagos.>")
                .storageType(StorageType.Memory)
                .build();
        JetStreamManagement jsm = nats.jetStreamManagement();
        jsm.addStream(config);                          // idempotente si la configuración es la misma
        return config;
    }
}
