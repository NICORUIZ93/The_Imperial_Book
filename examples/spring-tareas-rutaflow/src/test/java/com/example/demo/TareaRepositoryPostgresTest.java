package com.example.demo;

import javax.sql.DataSource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class TareaRepositoryPostgresTest {
    @Container
    static final PostgreSQLContainer postgres =
        new PostgreSQLContainer("postgres:16-alpine");

    @DynamicPropertySource
    static void conectarPostgres(DynamicPropertyRegistry properties) {
        properties.add("spring.datasource.url", postgres::getJdbcUrl);
        properties.add("spring.datasource.username", postgres::getUsername);
        properties.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired TareaRepository tareas;
    @Autowired DataSource dataSource;

@Test
void postgresEsLaBaseDeDatosConectada() throws Exception {
    try (var connection = dataSource.getConnection()) {
        assertThat(connection.getMetaData().getDatabaseProductName())
            .isEqualTo("PostgreSQL");
    }
}

@Test
void guardaYConsultaContraPostgres() {
    Tarea guardada = tareas.saveAndFlush(
        new Tarea("Caja térmica", 2, "BODEGA-A"));

    assertThat(tareas.findByPrioridadGreaterThanEqual(2))
        .extracting(Tarea::getId)
        .contains(guardada.getId());
}
}
