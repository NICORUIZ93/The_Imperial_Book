package academia.catalogo;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Healthcheck para imágenes distroless (no hay curl ni shell): «java -cp catalogo.jar academia.catalogo.SondaSalud URL».
 * Solo usa el JDK. Sale con 0 si la URL responde 200 y con 1 en cualquier otro caso.
 */
public final class SondaSalud {

    private SondaSalud() {
    }

    public static void main(String[] args) {
        String url = args.length > 0 ? args[0] : "http://localhost:8080/actuator/health/readiness";
        try {
            HttpResponse<Void> r = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2)).build()
                    .send(HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofSeconds(2)).build(),
                            HttpResponse.BodyHandlers.discarding());
            System.exit(r.statusCode() == 200 ? 0 : 1);
        } catch (Exception e) {
            System.exit(1);
        }
    }
}
