package academia.rutaflow.spatial;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
class ConsultaEspacialMySqlTest {
    @Container
    static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.0.36");

    @BeforeEach
    void crearTabla() throws SQLException {
        try (Connection connection = conexion(); Statement statement = connection.createStatement()) {
            statement.execute("DROP TABLE IF EXISTS punto");
            statement.execute("""
                CREATE TABLE punto (
                    id BIGINT PRIMARY KEY AUTO_INCREMENT,
                    ubicacion POINT NOT NULL SRID 4326,
                    SPATIAL INDEX idx_ubicacion (ubicacion)
                ) ENGINE=InnoDB
                """);
        }
    }

    @Test
    void distanciaEntreBogotaYMedellinSeMideEnMetros() throws SQLException {
        try (Connection connection = conexion(); Statement statement = connection.createStatement()) {
            statement.execute("""
                INSERT INTO punto (ubicacion) VALUES
                  (ST_GeomFromText('POINT(-74.08 4.61)', 4326, 'axis-order=long-lat')),
                  (ST_GeomFromText('POINT(-75.56 6.25)', 4326, 'axis-order=long-lat'))
                """);

            try (ResultSet result = statement.executeQuery("""
                    SELECT ST_Distance_Sphere(
                        (SELECT ubicacion FROM punto WHERE id=1),
                        (SELECT ubicacion FROM punto WHERE id=2)
                    ) AS metros
                    """)) {
                result.next();
                assertThat(result.getDouble("metros")).isBetween(230_000.0, 250_000.0);
            }
        }
    }

    @Test
    void explainUsaIndiceEspacialParaReducirElAreaDeBusqueda() throws SQLException {
        try (Connection connection = conexion(); Statement statement = connection.createStatement()) {
            statement.execute("""
                INSERT INTO punto (ubicacion) VALUES
                  (ST_GeomFromText('POINT(-74.08 4.61)', 4326, 'axis-order=long-lat')),
                  (ST_GeomFromText('POINT(-75.56 6.25)', 4326, 'axis-order=long-lat'))
                """);

            try (ResultSet result = statement.executeQuery("""
                    EXPLAIN SELECT id FROM punto FORCE INDEX (idx_ubicacion)
                    WHERE MBRContains(
                        ST_GeomFromText(
                            'POLYGON((-76 4,-76 7,-73 7,-73 4,-76 4))',
                            4326,
                            'axis-order=long-lat'
                        ),
                        ubicacion
                    )
                    """)) {
                result.next();
                assertThat(result.getString("key")).isEqualTo("idx_ubicacion");
            }
        }
    }

    @Test
    void srid4326PorDefectoInterpretaElPrimerEjeComoLatitud() throws SQLException {
        try (Connection connection = conexion(); Statement statement = connection.createStatement();
             ResultSet result = statement.executeQuery("""
                 SELECT
                   ST_Latitude(ST_GeomFromText('POINT(-74.08 4.61)', 4326)) AS latitud,
                   ST_Longitude(ST_GeomFromText('POINT(-74.08 4.61)', 4326)) AS longitud
                 """)) {
            result.next();
            assertThat(result.getDouble("latitud")).isEqualTo(-74.08);
            assertThat(result.getDouble("longitud")).isEqualTo(4.61);
        }
    }

    private Connection conexion() throws SQLException {
        return DriverManager.getConnection(MYSQL.getJdbcUrl(), MYSQL.getUsername(), MYSQL.getPassword());
    }
}
