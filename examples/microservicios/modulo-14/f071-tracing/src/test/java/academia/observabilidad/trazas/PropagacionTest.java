package academia.observabilidad.trazas;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.micrometer.tracing.test.autoconfigure.AutoConfigureTracing;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

/**
 * La petición entra con un traceparent conocido (como si viniera del gateway) y un HttpServer del JDK
 * hace de inventario y guarda el traceparent que recibe: debe tener el MISMO trace-id y un span-id nuevo.
 */
@SpringBootTest(properties = "management.tracing.sampling.probability=1.0")
@AutoConfigureMockMvc
@AutoConfigureTracing
class PropagacionTest {

    static final String TRAZA = "4bf92f3577b34da6a3ce929d0e0e4736";
    static final String SPAN_PADRE = "00f067aa0ba902b7";
    static final AtomicReference<String> recibido = new AtomicReference<>();
    static final HttpServer inventario = arrancar();

    static HttpServer arrancar() {
        try {
            HttpServer s = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
            s.createContext("/stock", ex -> {
                recibido.set(ex.getRequestHeaders().getFirst("traceparent"));
                byte[] b = "{\"sku\":\"CAFE-1\",\"stock\":12}".getBytes(StandardCharsets.UTF_8);
                ex.getResponseHeaders().add("Content-Type", "application/json");
                ex.sendResponseHeaders(200, b.length);
                ex.getResponseBody().write(b);
                ex.close();
            });
            s.start();
            return s;
        } catch (IOException e) { throw new IllegalStateException(e); }
    }

    @DynamicPropertySource
    static void url(DynamicPropertyRegistry r) {
        r.add("tienda.inventario.url", () -> "http://127.0.0.1:" + inventario.getAddress().getPort());
    }

    @AfterAll
    static void parar() { inventario.stop(0); }

    @Autowired MockMvc mvc;

    @Test
    void elTraceIdEntranteLlegaAInventarioConOtroSpanId() throws Exception {
        mvc.perform(get("/pedidos/P-7").header("traceparent", "00-" + TRAZA + "-" + SPAN_PADRE + "-01"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.stock.stock").value(12));

        String tp = recibido.get();
        assertThat(tp).matches("00-[0-9a-f]{32}-[0-9a-f]{16}-01");
        assertThat(tp).startsWith("00-" + TRAZA + "-");           // misma traza
        assertThat(tp).doesNotContain(SPAN_PADRE);                 // span nuevo (hijo), no el del gateway
    }
}
