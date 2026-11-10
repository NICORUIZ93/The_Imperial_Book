package com.example.demo;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class MigracionesTest {
    @Autowired Flyway flyway;
    @Autowired TareaRepository tareas;

    @Test
    void flywayRegistroLaMigracionInicial() {
        assertThat(flyway.info().applied())
            .extracting(migration -> migration.getVersion().getVersion())
            .contains("1");
    }

    @Test
    void laTablaCreadaPorFlywayAceptaUnaTarea() {
        Tarea guardada = tareas.saveAndFlush(
            new Tarea("Probar esquema", 2, "BODEGA-A")
        );
        assertThat(tareas.findById(guardada.getId())).isPresent();
    }
}
