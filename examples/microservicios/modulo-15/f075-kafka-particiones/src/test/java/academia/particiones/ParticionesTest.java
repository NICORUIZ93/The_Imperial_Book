package academia.particiones;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Supplier;

import org.apache.kafka.clients.admin.Admin;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.ConsumerGroupDescription;
import org.apache.kafka.clients.admin.MemberDescription;
import org.apache.kafka.common.utils.Utils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Requiere el Kafka 4.4.0 del docker-compose.yml del módulo: docker compose up -d --wait kafka
 * Cada ejecución usa un identificador nuevo en el VALOR; las CLAVES (cliente-1..6) son siempre las mismas.
 */
@SpringBootTest
class ParticionesTest {

    static final int MENSAJES_POR_CLIENTE = 5;

    @Autowired PublicadorPedidos publicador;
    @Autowired Consumidores consumidores;
    @Value("${spring.kafka.bootstrap-servers}") String bootstrap;

    final String corrida = UUID.randomUUID().toString().substring(0, 8);

    /** Publica 6 clientes x 5 pedidos y devuelve, por cliente, las particiones donde quedaron. */
    Map<String, Set<Integer>> publicarTodo() throws Exception {
        Map<String, Set<Integer>> particiones = new HashMap<>();
        for (int n = 1; n <= MENSAJES_POR_CLIENTE; n++) {
            for (int c = 1; c <= 6; c++) {
                String cliente = "cliente-" + c;
                int p = publicador.publicar(cliente, corrida + ":pedido-" + n);
                particiones.computeIfAbsent(cliente, k -> new HashSet<>()).add(p);
            }
        }
        return particiones;
    }

    List<Recepcion> deEstaCorrida(Iterable<Recepcion> cola) {
        var lista = new java.util.ArrayList<Recepcion>();
        cola.forEach(r -> { if (r.valor().startsWith(corrida)) lista.add(r); });
        return lista;
    }

    static void esperar(Supplier<Boolean> condicion, int segundos) throws InterruptedException {
        long limite = System.currentTimeMillis() + segundos * 1000L;
        while (!condicion.get() && System.currentTimeMillis() < limite) {
            Thread.sleep(200);
        }
    }

    @Test
    void laMismaClaveSiempreVaALaMismaParticionYEsLaQueCalculaMurmur2() throws Exception {
        Map<String, Set<Integer>> particiones = publicarTodo();
        particiones.forEach((cliente, ps) -> {
            assertThat(ps).as("particiones de %s", cliente).hasSize(1);
            int esperada = Utils.toPositive(Utils.murmur2(cliente.getBytes(StandardCharsets.UTF_8))) % 3;
            assertThat(ps).containsExactly(esperada);
        });
        System.out.println("Partición por cliente: " + new java.util.TreeMap<>(particiones));
    }

    @Test
    void cadaParticionLaLeeUnSoloConsumidorDelGrupoYOtroGrupoLoRecibeTodo() throws Exception {
        publicarTodo();
        esperar(() -> deEstaCorrida(consumidores.inventario).size() == 30
                && deEstaCorrida(consumidores.auditoria).size() == 30, 60);

        List<Recepcion> inventario = deEstaCorrida(consumidores.inventario);
        assertThat(inventario).hasSize(30);
        Map<Integer, Set<String>> hilosPorParticion = new HashMap<>();
        inventario.forEach(r -> hilosPorParticion.computeIfAbsent(r.particion(), k -> new HashSet<>()).add(r.hilo()));
        // Dentro de un grupo, una partición la consume UN solo consumidor: por eso se conserva el orden por clave.
        hilosPorParticion.values().forEach(hilos -> assertThat(hilos).hasSize(1));
        assertThat(hilosPorParticion).hasSize(3);
        // El otro grupo recibe los 30 registros: los grupos no compiten entre sí.
        assertThat(deEstaCorrida(consumidores.auditoria)).hasSize(30);
        System.out.println("Hilos de «inventario» por partición: " + new java.util.TreeMap<>(hilosPorParticion));
    }

    @Test
    void elGrupoInventarioTieneTresMiembrosConUnaParticionCadaUno() throws Exception {
        try (Admin admin = Admin.create(Map.of(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrap))) {
            ConsumerGroupDescription[] grupo = new ConsumerGroupDescription[1];
            esperar(() -> {
                try {
                    grupo[0] = admin.describeConsumerGroups(List.of("inventario"))
                            .describedGroups().get("inventario").get();
                    return grupo[0].members().size() == 3
                            && grupo[0].members().stream().allMatch(m -> m.assignment().topicPartitions().size() == 1);
                } catch (Exception e) {
                    return false;
                }
            }, 60);
            assertThat(grupo[0].members()).hasSize(3);
            for (MemberDescription m : grupo[0].members()) {
                assertThat(m.assignment().topicPartitions()).hasSize(1);
                System.out.println(m.clientId() + " -> " + m.assignment().topicPartitions());
            }
        }
    }
}
