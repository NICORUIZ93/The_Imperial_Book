package academia.bff;

import static org.assertj.core.api.Assertions.assertThat;

import academia.bff.movil.BffMovilApp;
import academia.bff.web.BffWebApp;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.context.ConfigurableApplicationContext;

class BffTest {

    static Backend catalogo, inventario, resenas;
    static ConfigurableApplicationContext movil, web;
    final HttpClient http = HttpClient.newHttpClient();

    @BeforeAll
    static void arrancar() throws Exception {
        catalogo = new Backend(150, p -> """
            {"id":7,"nombre":"Audífonos BT","precio":189000,"descripcion":"Audífonos inalámbricos con cancelación de ruido",
             "imagenes":["a.jpg","b.jpg","c.jpg","d.jpg","e.jpg"],
             "especificaciones":{"peso":"250 g","bluetooth":"5.4","garantia":"12 meses"}}""");
        inventario = new Backend(100, p -> "{\"sku\":7,\"stock\":12,\"bodega\":\"BOG-1\"}");
        resenas = new Backend(200, p -> "{\"promedio\":4.6,\"total\":318}");
        String[] urls = {"--server.port=0", "--CATALOGO_URL=" + catalogo.url(),
                         "--INVENTARIO_URL=" + inventario.url(), "--RESENAS_URL=" + resenas.url()};
        movil = BffMovilApp.arrancar(urls);
        web = BffWebApp.arrancar(urls);
    }

    @AfterAll
    static void apagar() {
        movil.close();
        web.close();
        catalogo.close();
        inventario.close();
        resenas.close();
    }

    HttpResponse<String> get(ConfigurableApplicationContext app, String ruta) throws Exception {
        String puerto = app.getEnvironment().getProperty("local.server.port");
        return http.send(HttpRequest.newBuilder(URI.create("http://localhost:" + puerto + ruta)).build(),
                         HttpResponse.BodyHandlers.ofString());
    }

    @Test
    void elMovilRecibeUnaTarjetaPequenaYLaWebLaFichaCompleta() throws Exception {
        get(movil, "/movil/productos/7");                            // calentamiento
        long t0 = System.nanoTime();
        String tarjeta = get(movil, "/movil/productos/7").body();
        long msMovil = (System.nanoTime() - t0) / 1_000_000;
        String ficha = get(web, "/web/productos/7").body();

        // Jackson 3 puede ordenar las propiedades: comprobamos cada campo, no el orden.
        assertThat(tarjeta).contains("\"id\":7", "\"nombre\":\"Audífonos BT\"", "\"precio\":189000",
                                     "\"stock\":12", "\"imagen\":\"a.jpg\"")
                           .doesNotContain("especificaciones", "descripcion");
        assertThat(ficha).contains("\"especificaciones\"", "\"promedio\":4.6", "\"bodega\":\"BOG-1\"");
        assertThat(tarjeta.length()).isLessThan(ficha.length() / 3);
        assertThat(msMovil).as("catálogo (150 ms) e inventario (100 ms) en paralelo").isLessThan(250);
    }
}
