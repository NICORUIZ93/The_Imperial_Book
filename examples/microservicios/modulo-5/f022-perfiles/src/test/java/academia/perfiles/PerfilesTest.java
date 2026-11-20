package academia.perfiles;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

import org.junit.jupiter.api.Test;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.context.properties.bind.validation.BindValidationException;
import org.springframework.context.ConfigurableApplicationContext;

class PerfilesTest {

    private TiendaProperties arrancar(String... argumentos) {
        try (ConfigurableApplicationContext ctx = new SpringApplicationBuilder(PerfilesApp.class).run(argumentos)) {
            return ctx.getBean(TiendaProperties.class);
        }
    }

    @Test
    void sinPerfilUsaLosValoresComunes() {
        TiendaProperties t = arrancar();
        assertThat(t.descuentoMaximo()).isEqualTo(10);
        assertThat(t.bdUrl()).isEqualTo("jdbc:postgresql://localhost:5432/tienda_dev");
    }

    @Test
    void elPerfilProdSobrescribeYLaUrlLlegaDeFuera() {
        TiendaProperties t = arrancar("--spring.profiles.active=prod",
            "--tienda.bd-url=jdbc:postgresql://bd-prod:5432/tienda");
        assertThat(t.descuentoMaximo()).isEqualTo(5);
        assertThat(t.moneda()).isEqualTo("COP");          // heredado de application.yml
        assertThat(t.bdUrl()).isEqualTo("jdbc:postgresql://bd-prod:5432/tienda");
    }

    @Test
    void laLineaDeComandosGanaAlArchivo() {
        assertThat(arrancar("--tienda.descuento-maximo=7").descuentoMaximo()).isEqualTo(7);
    }

    @Test
    void prodSinUrlNoArranca() {
        // Si exportaste TIENDA_BD_URL en tu terminal, el caso no aplica y el test se omite.
        assumeTrue(System.getenv("TIENDA_BD_URL") == null, "TIENDA_BD_URL está definida");
        assertThatThrownBy(() -> arrancar("--spring.profiles.active=prod"))
            .hasRootCauseInstanceOf(BindValidationException.class);
    }

    @Test
    void unValorFueraDeRangoNoArranca() {
        assertThatThrownBy(() -> arrancar("--tienda.descuento-maximo=80"))
            .hasRootCauseInstanceOf(BindValidationException.class);
    }
}
