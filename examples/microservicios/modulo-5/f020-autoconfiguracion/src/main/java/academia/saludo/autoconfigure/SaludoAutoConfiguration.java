package academia.saludo.autoconfigure;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;

/**
 * Auto-configuración: Spring Boot la carga porque aparece en
 * META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
 * y SOLO aplica sus beans si se cumplen las condiciones.
 */
@AutoConfiguration
@ConditionalOnClass(Saludador.class)                       // la clase está en el classpath
@ConditionalOnProperty(prefix = "saludo", name = "habilitado",
        havingValue = "true", matchIfMissing = true)       // no la apagaron por propiedad
@EnableConfigurationProperties(SaludoProperties.class)
public class SaludoAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean                              // si el usuario define el suyo, gana el suyo
    Saludador saludador(SaludoProperties propiedades) {
        return new Saludador(propiedades.prefijo());
    }

    @Bean
    @Conditional(ModoFormalCondition.class)                // condición propia
    FirmaFormal firmaFormal() {
        return new FirmaFormal("Atentamente, el equipo de la tienda");
    }
}
