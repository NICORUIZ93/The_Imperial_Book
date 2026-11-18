package academia.rutaflow.grpc;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.net.ServerSocket;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.grpc.test.autoconfigure.LocalGrpcServerPort;
import org.springframework.grpc.client.ImportGrpcClients;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@SpringBootTest(webEnvironment = WebEnvironment.NONE)
@ImportGrpcClients(target = "tarifa", types = TarifaServiceGrpc.TarifaServiceBlockingStub.class)
class TarifaGrpcTest {
    private static final int CLIENT_PORT = freePort();

    @LocalGrpcServerPort
    private int serverPort;

    @Autowired
    private TarifaServiceGrpc.TarifaServiceBlockingStub client;

    @DynamicPropertySource
    static void grpcPorts(DynamicPropertyRegistry properties) {
        properties.add("spring.grpc.server.port", () -> CLIENT_PORT);
        properties.add("spring.grpc.client.channel.tarifa.target", () -> "static://127.0.0.1:" + CLIENT_PORT);
    }

    @Test
    void calculaTarifaUsandoStubSobreCanalGrpc() {
        assertThat(serverPort).isEqualTo(CLIENT_PORT);
        TarifaResponse response = client.calcular(TarifaRequest.newBuilder().setDistanciaKm(10).build());
        assertThat(response.getMonto()).isEqualTo(15000.0);
    }

    private static int freePort() {
        try (ServerSocket socket = new ServerSocket(0)) {
            return socket.getLocalPort();
        } catch (IOException error) {
            throw new ExceptionInInitializerError(error);
        }
    }
}
