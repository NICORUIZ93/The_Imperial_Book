package academia.rutaflow.stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.stream.binder.test.EnableTestBinder;
import org.springframework.cloud.stream.binder.test.InputDestination;
import org.springframework.cloud.stream.binder.test.OutputDestination;
import org.springframework.messaging.support.GenericMessage;

@SpringBootTest
@EnableTestBinder
class RouteFunctionsTest {
    @Autowired InputDestination input;
    @Autowired OutputDestination output;

    @Test
    void transformaEnvioEnSolicitudDeRuta() {
        input.send(new GenericMessage<>(new ShipmentCreated("sh-42", "10ABC")));

        var result = output.receive(1_000, "routes.requested");
        assertThat(result).isNotNull();
        assertThat(new String((byte[]) result.getPayload())).contains("sh-42", "10");
    }

    @Test
    void codigoPostalCortoFallaEnLaFuncion() {
        assertThatThrownBy(() -> new RouteFunctions().planRoute()
                .apply(new ShipmentCreated("sh-43", "1")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("El código postal debe tener dos caracteres");
    }
}
