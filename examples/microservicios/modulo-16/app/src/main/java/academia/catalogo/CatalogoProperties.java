package academia.catalogo;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** catalogo.* · En Kubernetes: mensaje y color desde un ConfigMap, claveApi desde un Secret, version desde la imagen. */
@ConfigurationProperties("catalogo")
public record CatalogoProperties(String mensaje, String color, String version, String claveApi,
        int arranqueLentoSegundos) {
}
