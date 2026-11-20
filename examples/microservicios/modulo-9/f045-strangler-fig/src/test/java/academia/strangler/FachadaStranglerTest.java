package academia.strangler;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

/** Dos servidores HTTP de mentira (monolito y nuevo) en puertos libres; la fachada real decide a cuál ir. */
@SpringBootTest
@AutoConfigureMockMvc
class FachadaStranglerTest {

    static final HttpServer MONOLITO = servidor("monolito");
    static final HttpServer NUEVO = servidor("nuevo");

    static HttpServer servidor(String nombre) {
        try {
            HttpServer s = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
            s.createContext("/", ex -> {
                int codigo = ex.getRequestURI().getPath().endsWith("/999") ? 404 : 200;
                byte[] cuerpo = ("respondió " + nombre).getBytes(StandardCharsets.UTF_8);
                ex.getResponseHeaders().set("Content-Type", "text/plain; charset=utf-8");
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
    static void destinos(DynamicPropertyRegistry registro) {
        registro.add("strangler.destinos.monolito", () -> "http://127.0.0.1:" + MONOLITO.getAddress().getPort());
        registro.add("strangler.destinos.nuevo", () -> "http://127.0.0.1:" + NUEVO.getAddress().getPort());
    }

    @AfterAll
    static void apagar() {
        MONOLITO.stop(0);
        NUEVO.stop(0);
    }

    @Autowired
    MockMvc mvc;

    @Test
    void lasCotizacionesYaLasAtiendeElServicioNuevo() throws Exception {
        mvc.perform(get("/cotizaciones/7"))
            .andExpect(status().isOk())
            .andExpect(header().string("X-Servido-Por", "nuevo"))
            .andExpect(content().string("respondió nuevo"));
    }

    @Test
    void elRestoSigueEnElMonolito() throws Exception {
        mvc.perform(get("/clientes/1")).andExpect(header().string("X-Servido-Por", "monolito"));
        mvc.perform(get("/cotizaciones-pdf/7")).andExpect(header().string("X-Servido-Por", "monolito"));
    }

    @Test
    void losErroresDelDestinoLleganSinTransformarse() throws Exception {
        mvc.perform(get("/cotizaciones/999")).andExpect(status().isNotFound());
    }
}
