package academia.contenedores;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.postgresql.PostgreSQLContainer;

/** El mismo PostgreSQL como bean, para arrancar la app en desarrollo sin instalar nada. */
@TestConfiguration(proxyBeanMethods = false)
class ContenedoresDeDesarrollo {

    @Bean
    @ServiceConnection
    PostgreSQLContainer postgres() {
        return new PostgreSQLContainer("postgres:18.7");
    }
}
