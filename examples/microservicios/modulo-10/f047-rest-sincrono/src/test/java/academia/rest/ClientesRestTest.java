package academia.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.sun.net.httpserver.HttpServer;
import feign.FeignException;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeoutException;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;

/** Un inventario de mentira en un puerto libre; los cuatro clientes reales lo consultan. */
@SpringBootTest
class ClientesRestTest {

    static final HttpServer INVENTARIO = arrancarInventario();

    static HttpServer arrancarInventario() {
        try {
            HttpServer s = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
            s.createContext("/inventario/", ex -> {
                String sku = ex.getRequestURI().getPath().substring("/inventario/".length());
                if (sku.equals("LENTO")) {
                    try {
                        Thread.sleep(2_000);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }
                int codigo = sku.equals("NO-EXISTE") ? 404 : 200;
                byte[] cuerpo = ("{\"sku\":\"" + sku + "\",\"disponibles\":12}").getBytes(StandardCharsets.UTF_8);
                ex.getResponseHeaders().set("Content-Type", "application/json");
                ex.sendResponseHeaders(codigo, cuerpo.length);
                ex.getResponseBody().write(cuerpo);
                ex.close();
            });
            s.start();
            return s;
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
    }

    @DynamicPropertySource
    static void url(DynamicPropertyRegistry registro) {
        registro.add("inventario.url", () -> "http://127.0.0.1:" + INVENTARIO.getAddress().getPort());
    }

    @AfterAll
    static void apagar() {
        INVENTARIO.stop(0);
    }

    @Autowired ClienteRestTemplate restTemplate;
    @Autowired ClienteWebClient webClient;
    @Autowired ClienteFeign feign;
    @Autowired InventarioHttp httpExchange;

    @Test
    void losCuatroClientesObtienenLaMismaRespuesta() {
        var esperado = new Existencia("CAFE", 12);
        assertThat(restTemplate.consultar("CAFE")).isEqualTo(esperado);
        assertThat(webClient.consultar("CAFE").block()).isEqualTo(esperado);
        assertThat(feign.consultar("CAFE")).isEqualTo(esperado);
        assertThat(httpExchange.consultar("CAFE")).isEqualTo(esperado);
    }

    @Test
    void un404SeConvierteEnUnaExcepcionDistintaEnCadaCliente() {
        assertThatThrownBy(() -> restTemplate.consultar("NO-EXISTE")).isInstanceOf(HttpClientErrorException.NotFound.class);
        assertThatThrownBy(() -> feign.consultar("NO-EXISTE")).isInstanceOf(FeignException.NotFound.class);
        assertThatThrownBy(() -> httpExchange.consultar("NO-EXISTE")).isInstanceOf(HttpClientErrorException.NotFound.class);
    }

    @Test
    void elTimeoutCortaLaEsperaEnVezDeColgarAlLlamador() {
        assertThatThrownBy(() -> restTemplate.consultar("LENTO")).isInstanceOf(ResourceAccessException.class);
        assertThatThrownBy(() -> webClient.consultar("LENTO").block()).hasRootCauseInstanceOf(TimeoutException.class);
        assertThatThrownBy(() -> feign.consultar("LENTO")).isInstanceOf(FeignException.class);
    }
}
