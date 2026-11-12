package academia.rutaflow.pedidos;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.contract.stubrunner.spring.AutoConfigureStubRunner;
import org.springframework.cloud.contract.stubrunner.spring.StubRunnerPort;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.cloud.contract.stubrunner.spring.StubRunnerProperties.StubsMode.LOCAL;

@SpringBootTest
@AutoConfigureStubRunner(
        ids = "academia.rutaflow:conductor-producer:0.1.0-SNAPSHOT:stubs",
        stubsMode = LOCAL)
class ConductorContractTest {
    @Autowired
    ConductorClient client;

    @StubRunnerPort("conductor-producer")
    int stubPort;

    @Test
    void pedidosCanReadAvailabilityFromThePublishedContract() {
        ConductorClient.DriverAvailability result = client.availability(stubPort, "DR-7");

        assertThat(result.driverId()).isEqualTo("DR-7");
        assertThat(result.available()).isTrue();
    }
}
