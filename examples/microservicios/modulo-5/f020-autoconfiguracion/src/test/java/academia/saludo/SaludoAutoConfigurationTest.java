package academia.saludo;

import static org.assertj.core.api.Assertions.assertThat;

import academia.app.SaludoApp;
import academia.saludo.autoconfigure.FirmaFormal;
import academia.saludo.autoconfigure.SaludoAutoConfiguration;
import academia.saludo.autoconfigure.Saludador;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.AutoConfigurations;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

class SaludoAutoConfigurationTest {

    // Contexto mínimo que solo carga nuestra auto-configuración.
    private final ApplicationContextRunner runner = new ApplicationContextRunner()
        .withConfiguration(AutoConfigurations.of(SaludoAutoConfiguration.class));

    @Test
    void sinConfigurarNadaCreaElSaludadorPorDefecto() {
        runner.run(ctx -> {
            assertThat(ctx).hasSingleBean(Saludador.class);
            assertThat(ctx.getBean(Saludador.class).saludar("Ana")).isEqualTo("Hola, Ana!");
            assertThat(ctx).doesNotHaveBean(FirmaFormal.class);
        });
    }

    @Test
    void laPropiedadCambiaElPrefijo() {
        runner.withPropertyValues("saludo.prefijo=Buenas")
            .run(ctx -> assertThat(ctx.getBean(Saludador.class).saludar("Ana")).isEqualTo("Buenas, Ana!"));
    }

    @Test
    void sePuedeApagarConUnaPropiedad() {
        runner.withPropertyValues("saludo.habilitado=false")
            .run(ctx -> assertThat(ctx).doesNotHaveBean(Saludador.class));
    }

    @Test
    void elBeanDelUsuarioGanaPorConditionalOnMissingBean() {
        runner.withUserConfiguration(MiSaludo.class)
            .run(ctx -> {
                assertThat(ctx).hasSingleBean(Saludador.class);
                assertThat(ctx.getBean(Saludador.class).saludar("Ana")).isEqualTo("Quiubo, Ana!");
            });
    }

    @Test
    void laCondicionPropiaActivaLaFirmaFormal() {
        runner.withPropertyValues("saludo.formal=true")
            .run(ctx -> assertThat(ctx).hasSingleBean(FirmaFormal.class));
    }

    @Test
    void laAppLaRecibePorElArchivoImports() {
        try (ConfigurableApplicationContext ctx = new SpringApplicationBuilder(SaludoApp.class).run()) {
            assertThat(ctx.getBean(Saludador.class).saludar("Ana")).isEqualTo("Hola, Ana!");
        }
    }

    @Configuration(proxyBeanMethods = false)
    static class MiSaludo {
        @Bean
        Saludador miSaludador() { return new Saludador("Quiubo"); }
    }
}
