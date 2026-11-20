package academia.consultas;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Sort;

/** Requiere el PostgreSQL del módulo (docker compose up -d --wait). */
@SpringBootTest(properties = {"spring.main.web-application-type=none"},
                classes = {ConsultasApp.class})
class ConsultasTest {

    @Autowired ProductoRepository repo;
    @Autowired ReporteCriteria reporte;

    @BeforeEach
    void datos() {
        repo.deleteAll();
        repo.saveAll(ConsultasApp.catalogo());
    }

    @Test
    void sinFiltrosDevuelveTodo() {
        var filtro = new FiltroProductos(null, null, null, null, null);
        assertThat(repo.count(ProductoSpecs.desde(filtro))).isEqualTo(5);
    }

    @Test
    void combinaTextoPrecioYActivos() {
        var filtro = new FiltroProductos("CAFÉ", null, new BigDecimal("30000"), null, true);
        assertThat(repo.findAll(ProductoSpecs.desde(filtro), Sort.by("precio")))
            .extracting(Producto::getNombre)
            .containsExactly("Café de Huila 500 g", "Café de Nariño 1 kg");
    }

    @Test
    void filtraPorCategoriaYRango() {
        var filtro = new FiltroProductos(null, "menaje", null, new BigDecimal("50000"), null);
        assertThat(repo.findAll(ProductoSpecs.desde(filtro)))
            .extracting(Producto::getNombre).containsExactly("Taza de cerámica");
    }

    @Test
    void criteriaAgrupaYPromedia() {
        assertThat(reporte.promedioPorCategoria()).containsExactly(
            new PromedioCategoria("cafe", 46500.0, 2L),
            new PromedioCategoria("menaje", 56500.0, 2L));
    }
}
