package academia.discovery;

import static org.assertj.core.api.Assertions.assertThat;

import academia.discovery.catalogo.CatalogoApp;
import academia.discovery.servidor.EurekaServidorApp;
import java.net.ServerSocket;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.context.ConfigurableApplicationContext;

class EurekaRegistroTest {

    @Test
    void dosInstanciasDeCatalogoSeRegistranYSeDescubren() throws Exception {
        int puertoEureka = libre(), puerto1 = libre(), puerto2 = libre();
        String eureka = "--eureka.client.service-url.defaultZone=http://localhost:" + puertoEureka + "/eureka/";
        try (ConfigurableApplicationContext servidor = EurekaServidorApp.arrancar("--server.port=" + puertoEureka);
             ConfigurableApplicationContext c1 = CatalogoApp.arrancar("--server.port=" + puerto1, eureka);
             ConfigurableApplicationContext c2 = CatalogoApp.arrancar("--server.port=" + puerto2, eureka)) {

            DiscoveryClient discovery = c1.getBean(DiscoveryClient.class);
            List<ServiceInstance> instancias = List.of();
            for (int i = 0; i < 60 && instancias.size() < 2; i++) {   // hasta 30 s
                Thread.sleep(500);
                instancias = discovery.getInstances("catalogo");
            }
            assertThat(instancias).extracting(ServiceInstance::getPort).containsExactlyInAnyOrder(puerto1, puerto2);
            assertThat(instancias).extracting(ServiceInstance::getInstanceId)
                .containsExactlyInAnyOrder("catalogo:" + puerto1, "catalogo:" + puerto2);
        }
    }

    static int libre() throws Exception {
        try (ServerSocket s = new ServerSocket(0)) {
            return s.getLocalPort();
        }
    }
}
