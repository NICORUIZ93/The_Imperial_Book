package academia.observabilidad.metricas;

import static org.assertj.core.api.Assertions.assertThat;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Timer;
import io.micrometer.prometheusmetrics.PrometheusConfig;
import io.micrometer.prometheusmetrics.PrometheusMeterRegistry;
import java.time.Duration;
import org.junit.jupiter.api.Test;

/** Micrometer sin Spring: qué escribe el registro Prometheus para un contador y un timer con SLO. */
class RegistroPrometheusTest {

    @Test
    void contadorYTimerEnFormatoPrometheus() {
        PrometheusMeterRegistry registro = new PrometheusMeterRegistry(PrometheusConfig.DEFAULT);
        Counter web = Counter.builder("pedidos.creados").tag("canal", "web").register(registro);
        web.increment();
        web.increment();
        Timer t = Timer.builder("http.server.requests").tag("uri", "/pedidos/{id}")
            .serviceLevelObjectives(Duration.ofMillis(100), Duration.ofMillis(500))
            .register(registro);
        t.record(Duration.ofMillis(80));
        t.record(Duration.ofMillis(700));

        String scrape = registro.scrape();
        // El orden de las etiquetas y el formato del número (1 o 1.0) dependen del escritor: se comprueba lo esencial.
        assertThat(scrape).contains("# TYPE pedidos_creados_total counter");
        assertThat(scrape).containsPattern("pedidos_creados_total\\{canal=\"web\"\\} 2(\\.0)?\\n");
        assertThat(scrape).containsPattern("http_server_requests_seconds_bucket\\{[^}]*le=\"0\\.1\"[^}]*\\} 1(\\.0)?\\n");
        assertThat(scrape).containsPattern("http_server_requests_seconds_bucket\\{[^}]*le=\"0\\.5\"[^}]*\\} 1(\\.0)?\\n");
        assertThat(scrape).containsPattern("http_server_requests_seconds_count\\{uri=\"/pedidos/\\{id\\}\"\\} 2(\\.0)?\\n");
    }
}
