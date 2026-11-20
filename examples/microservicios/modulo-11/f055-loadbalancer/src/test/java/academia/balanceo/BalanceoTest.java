package academia.balanceo;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import java.util.TreeMap;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@SpringBootTest
class BalanceoTest {

    static Backend[] instancias = new Backend[3];

    @DynamicPropertySource
    static void instancias(DynamicPropertyRegistry r) throws Exception {
        for (int i = 0; i < 3; i++) {
            String nombre = "catalogo-" + (i + 1);
            instancias[i] = new Backend(0, p -> nombre);
            int n = i;
            r.add("spring.cloud.discovery.client.simple.instances.catalogo[" + i + "].uri", () -> instancias[n].url());
        }
    }

    @AfterAll
    static void apagar() {
        for (Backend b : instancias) b.close();
    }

    @Autowired CatalogoCliente cliente;

    Map<String, Integer> repartir(int llamadas) {
        Map<String, Integer> cuenta = new TreeMap<>();
        for (int i = 0; i < llamadas; i++) {
            String quien;
            try {
                quien = cliente.quienAtiende();
            } catch (Exception e) {
                quien = "ERROR";
            }
            cuenta.merge(quien, 1, Integer::sum);
        }
        return cuenta;
    }

    @Test
    void roundRobinRepartePorIgualYSinHealthCheckUnaCaidaProduceErrores() {
        assertThat(repartir(6)).isEqualTo(Map.of("catalogo-1", 2, "catalogo-2", 2, "catalogo-3", 2));

        instancias[1].apagar();                         // catalogo-2 muere; la lista NO cambia
        Map<String, Integer> conUnaCaida = repartir(6);
        assertThat(conUnaCaida).containsEntry("ERROR", 2).doesNotContainKey("catalogo-2");
    }
}
