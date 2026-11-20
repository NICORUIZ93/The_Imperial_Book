package academia.motores;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

/** Las mismas pruebas para los dos motores. Requiere docker compose up -d --wait. */
@SpringBootTest(properties = "spring.main.web-application-type=none")
abstract class ContratoMotorTest {

    @Autowired Inventario inventario;
    @Autowired ProductoRepository repo;

    @BeforeEach
    void limpiar() { repo.deleteAll(); }

    @Test
    void elUpsertCreaYLuegoSuma() {
        inventario.sumarStock("CAF-1", "Café de Huila", 10);
        inventario.sumarStock("CAF-1", "Café de Huila", 5);
        assertThat(repo.findBySku("CAF-1").orElseThrow().getStock()).isEqualTo(15);
        assertThat(repo.count()).isEqualTo(1);
    }

    @Test
    void jpaGuardaYGeneraElIdEnAmbos() {
        Producto p = repo.save(new Producto("TAZ-3", "Taza", 4));
        assertThat(p.getId()).isPositive();
    }

    /** Diferencia real entre motores: comparar texto con otras mayúsculas y sin tilde. */
    abstract boolean comparaSinMayusculasNiTildes();

    @Test
    void laCollationDecideSiCafeEsIgualACAFE() {
        repo.save(new Producto("CAF-1", "Café de Huila", 1));
        assertThat(repo.countByNombre("CAFE DE HUILA") == 1).isEqualTo(comparaSinMayusculasNiTildes());
    }
}
