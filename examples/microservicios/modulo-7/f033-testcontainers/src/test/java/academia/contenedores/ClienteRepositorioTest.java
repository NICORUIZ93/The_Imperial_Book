package academia.contenedores;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

/**
 * Testcontainers arranca un PostgreSQL 18.7 REAL en Docker antes de los tests y lo destruye al final.
 * @ServiceConnection entrega a Spring Boot la URL, el usuario y la clave: no hay application-test.properties.
 */
@Testcontainers
@SpringBootTest
class ClienteRepositorioTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:18.7");

    @Autowired ClienteRepositorio repositorio;

    @Test
    void elUpsertCuentaVisitasSinDuplicarFilas() {
        assertThat(repositorio.registrarVisita("ana@example.com", "Ana")).isEqualTo(1);
        assertThat(repositorio.registrarVisita("ana@example.com", "Ana")).isEqualTo(2);
        assertThat(repositorio.registrarVisita("ana@example.com", "Ana")).isEqualTo(3);
    }

    @Test
    void ilikeNoDistingueMayusculas() {
        repositorio.registrarVisita("beto@example.com", "Alberto");
        assertThat(repositorio.buscarPorNombre("BER"))
                .extracting(Cliente::email)
                .containsExactly("beto@example.com");
    }

    @Test
    void laBaseEsDeVerdadPostgres18() {
        assertThat(postgres.isRunning()).isTrue();
        assertThat(postgres.getJdbcUrl()).startsWith("jdbc:postgresql://");
    }
}
