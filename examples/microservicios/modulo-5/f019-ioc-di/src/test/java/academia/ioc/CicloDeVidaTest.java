package academia.ioc;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;

class CicloDeVidaTest {

    @Test
    void elContenedorRespetaElOrdenDelCicloDeVida() {
        Ciclo.limpiar();
        try (ConfigurableApplicationContext contexto = new SpringApplicationBuilder(IocApp.class).run()) {
            ServicioPedidos servicio = contexto.getBean(ServicioPedidos.class);
            assertThat(servicio.confirmar("P-1"))
                .isEqualTo("Correo enviado: pedido P-1 confirmado (zona America/Bogota)");
            // Singleton: el contenedor devuelve siempre la misma instancia.
            assertThat(contexto.getBean(ServicioPedidos.class)).isSameAs(servicio);
            // DI por interfaz: quien pide Notificador recibe la implementación registrada.
            assertThat(contexto.getBean(Notificador.class)).isInstanceOf(NotificadorCorreo.class);
        }
        assertThat(Ciclo.eventos()).containsExactly(
            "1. constructor: recibe NotificadorCorreo",
            "2. setter: recibe Clock",
            "3. @PostConstruct",
            "4. afterPropertiesSet",
            "5. BeanPostProcessor: servicioPedidos listo para usarse",
            "6. ApplicationReadyEvent: la app atiende",
            "7. @PreDestroy",
            "8. destroy");
    }
}
