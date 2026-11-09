package academia.rutaflow.hibernate.posicion;

import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@Testcontainers
@SpringBootTest
class PosicionConductorTest {
    @Container
    static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.0.36")
        .withStartupTimeout(Duration.ofMinutes(3));

    @DynamicPropertySource
    static void propiedadesMySql(DynamicPropertyRegistry properties) {
        properties.add("spring.datasource.url", MYSQL::getJdbcUrl);
        properties.add("spring.datasource.username", MYSQL::getUsername);
        properties.add("spring.datasource.password", MYSQL::getPassword);
    }

    @Autowired
    PosicionConductorRepository posiciones;

    private static final GeometryFactory GEOMETRIA = new GeometryFactory(new PrecisionModel(), 4326);

    @Test
    void puntoJtsPersisteYSeLeeConSusCoordenadasYSrid() {
        var punto = GEOMETRIA.createPoint(new Coordinate(-74.08, 4.61));
        var guardado = posiciones.saveAndFlush(new PosicionConductor(punto));

        var leido = posiciones.findById(guardado.getId()).orElseThrow();

        assertThat(leido.getUbicacion().getX()).isEqualTo(-74.08);
        assertThat(leido.getUbicacion().getY()).isEqualTo(4.61);
        assertThat(leido.getUbicacion().getSRID()).isEqualTo(4326);
    }

    @Test
    void versionDetectaLaSegundaEscrituraBasadaEnUnaLecturaVieja() {
        var inicial = posiciones.saveAndFlush(new PosicionConductor(punto(-74.0, 4.6)));
        var versionViejaA = posiciones.findById(inicial.getId()).orElseThrow();
        var versionViejaB = posiciones.findById(inicial.getId()).orElseThrow();

        versionViejaA.actualizarUbicacion(punto(-74.1, 4.7));
        posiciones.saveAndFlush(versionViejaA);

        versionViejaB.actualizarUbicacion(punto(-74.2, 4.8));
        assertThatThrownBy(() -> posiciones.saveAndFlush(versionViejaB))
            .isInstanceOf(ObjectOptimisticLockingFailureException.class);
    }

    private static org.locationtech.jts.geom.Point punto(double longitud, double latitud) {
        return GEOMETRIA.createPoint(new Coordinate(longitud, latitud));
    }
}
