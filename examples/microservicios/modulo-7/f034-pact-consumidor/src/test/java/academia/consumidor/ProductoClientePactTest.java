package academia.consumidor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Map;

import au.com.dius.pact.consumer.MockServer;
import au.com.dius.pact.consumer.dsl.PactDslJsonBody;
import au.com.dius.pact.consumer.dsl.PactDslWithProvider;
import au.com.dius.pact.consumer.junit5.PactConsumerTestExt;
import au.com.dius.pact.consumer.junit5.PactTestFor;
import au.com.dius.pact.core.model.PactSpecVersion;
import au.com.dius.pact.core.model.V4Pact;
import au.com.dius.pact.core.model.annotations.Pact;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.web.client.HttpClientErrorException;

/**
 * Test del CONSUMIDOR: Pact levanta un servidor HTTP simulado que responde según las interacciones
 * declaradas; si el cliente las usa bien, Pact escribe el contrato en build/pacts/tienda-web-catalogo.json.
 */
@ExtendWith(PactConsumerTestExt.class)
@PactTestFor(providerName = "catalogo", pactVersion = PactSpecVersion.V4)
public class ProductoClientePactTest {

    @Pact(consumer = "tienda-web")
    public V4Pact productoExiste(PactDslWithProvider builder) {
        return builder
                .given("existe el producto 1")                      // estado que el PROVEEDOR debe preparar
                .uponReceiving("obtener el producto 1")
                    .path("/productos/1")
                    .method("GET")
                .willRespondWith()
                    .status(200)
                    .headers(Map.of("Content-Type", "application/json"))
                    .body(new PactDslJsonBody()
                            .integerType("id", 1)                   // cualquier entero (ejemplo: 1)
                            .stringType("nombre", "Teclado")        // cualquier texto
                            .integerType("precio", 100))
                .toPact(V4Pact.class);
    }

    @Pact(consumer = "tienda-web")
    public V4Pact productoNoExiste(PactDslWithProvider builder) {
        return builder
                .given("no existe el producto 99")
                .uponReceiving("obtener un producto inexistente")
                    .path("/productos/99")
                    .method("GET")
                .willRespondWith()
                    .status(404)
                .toPact(V4Pact.class);
    }

    @Test
    @PactTestFor(pactMethod = "productoExiste")
    void leeElProducto(MockServer servidor) {
        Producto p = new ProductoCliente(servidor.getUrl()).obtener(1);

        assertThat(p.nombre()).isEqualTo("Teclado");
        assertThat(p.precio()).isEqualTo(100);
    }

    @Test
    @PactTestFor(pactMethod = "productoNoExiste")
    void unProductoInexistenteEsUn404(MockServer servidor) {
        assertThatThrownBy(() -> new ProductoCliente(servidor.getUrl()).obtener(99))
                .isInstanceOf(HttpClientErrorException.NotFound.class);
    }
}
