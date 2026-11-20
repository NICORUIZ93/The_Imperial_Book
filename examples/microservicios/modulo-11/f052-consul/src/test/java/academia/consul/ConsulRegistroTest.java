package academia.consul;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.consul.ConsulContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ConsulRegistroTest {

    @Container
    static ConsulContainer consul = new ConsulContainer("hashicorp/consul:2.1.0");

    @DynamicPropertySource
    static void consul(DynamicPropertyRegistry r) {
        r.add("spring.cloud.consul.host", consul::getHost);
        r.add("spring.cloud.consul.port", () -> consul.getMappedPort(8500));
        // El chequeo HTTP lo hace Consul desde el contenedor: no llega a tu puerto local, así que
        // en el test lo desactivamos y solo comprobamos registro y descubrimiento.
        r.add("spring.cloud.consul.discovery.register-health-check", () -> "false");
    }

    @Autowired DiscoveryClient discovery;

    @Test
    void elCatalogoApareceEnConsul() throws Exception {
        List<ServiceInstance> instancias = List.of();
        for (int i = 0; i < 20 && instancias.isEmpty(); i++) {
            Thread.sleep(500);
            instancias = discovery.getInstances("catalogo");
        }
        assertThat(instancias).hasSize(1);
        assertThat(instancias.getFirst().getInstanceId()).startsWith("catalogo-");
        assertThat(discovery.getServices()).contains("catalogo", "consul");
    }
}
