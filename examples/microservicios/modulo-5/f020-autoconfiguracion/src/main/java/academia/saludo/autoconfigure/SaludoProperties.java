package academia.saludo.autoconfigure;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/** Propiedades saludo.* que el usuario del starter puede cambiar en application.properties. */
@ConfigurationProperties("saludo")
public record SaludoProperties(
        @DefaultValue("true") boolean habilitado,
        @DefaultValue("Hola") String prefijo,
        @DefaultValue("false") boolean formal) { }
