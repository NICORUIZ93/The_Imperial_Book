package academia.proveedor;

import au.com.dius.pact.provider.junit5.HttpTestTarget;
import au.com.dius.pact.provider.junit5.PactVerificationContext;
import au.com.dius.pact.provider.junit5.PactVerificationInvocationContextProvider;
import au.com.dius.pact.provider.junitsupport.Provider;
import au.com.dius.pact.provider.junitsupport.State;
import au.com.dius.pact.provider.junitsupport.loader.PactBroker;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestTemplate;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.server.LocalServerPort;

/**
 * Igual que ContratoDesdeCarpetaTest, pero el contrato viene del Pact Broker.
 * El nombre termina en "Manual" a propósito: build.gradle.kts excluye las clases *Manual salvo que añadas -Pbroker
 * (así "./gradlew test" no necesita el broker encendido). Se pide con --tests ContratoDesdeBrokerManual -Pbroker.
 */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@Provider("catalogo")
@PactBroker(host = "${pactbroker.host}", port = "${pactbroker.port}")
class ContratoDesdeBrokerManual {

    @LocalServerPort int puerto;
    @Autowired Productos productos;

    @BeforeEach
    void apuntarAlServicio(PactVerificationContext contexto) {
        contexto.setTarget(new HttpTestTarget("localhost", puerto, "/"));
    }

    @TestTemplate
    @ExtendWith(PactVerificationInvocationContextProvider.class)
    void verificaCadaInteraccion(PactVerificationContext contexto) {
        contexto.verifyInteraction();
    }

    @State("existe el producto 1")
    void existeElProducto1() {
        productos.guardar(new Producto(1, "Teclado", 100, 7));
    }

    @State("no existe el producto 99")
    void noExisteElProducto99() {
        productos.borrar(99);
    }
}
