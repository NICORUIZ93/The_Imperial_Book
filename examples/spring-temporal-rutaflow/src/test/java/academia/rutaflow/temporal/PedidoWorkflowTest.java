package academia.rutaflow.temporal;

import io.temporal.client.WorkflowClient;
import io.temporal.client.WorkflowOptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.ComponentScan;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest(classes = PedidoWorkflowTest.Config.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class PedidoWorkflowTest {
    @Autowired ConfigurableApplicationContext context;
    @Autowired WorkflowClient client;
    @Autowired ActivityRecorder recorder;

    @BeforeEach
    void startAndReset() {
        context.start();
        recorder.reset();
    }

    @Test
    void retriesTransientFailureAndCompletes() {
        recorder.failChargeOnce();
        String result = workflow("RF-101").procesar("RF-101", 25_000);

        assertTrue(result.startsWith("CONFIRMADO"));
        assertEquals(2, recorder.chargeAttempts());
        assertTrue(recorder.events().contains("notificar:RF-101"));
        assertFalseCompensationWasRun();
    }

    @Test
    void permanentChargeFailureCompensatesInReverseOrder() {
        recorder.rejectCharge();

        assertThrows(RuntimeException.class,
                () -> workflow("RF-102").procesar("RF-102", 25_000));

        assertEquals(3, recorder.chargeAttempts());
        assertEquals(List.of("liberar-repartidor:REP-RF-102", "liberar-inventario:RF-102"),
                recorder.events().stream().filter(event -> event.startsWith("liberar-")).toList());
    }

    @Test
    void notificationFailureAlsoRefundsTheSuccessfulCharge() {
        recorder.failNotification();

        assertThrows(RuntimeException.class,
                () -> workflow("RF-103").procesar("RF-103", 25_000));

        assertEquals(List.of("devolver-cobro:RF-103", "liberar-repartidor:REP-RF-103",
                        "liberar-inventario:RF-103"),
                recorder.events().stream().filter(event -> event.startsWith("devolver-")
                        || event.startsWith("liberar-")).toList());
    }

    private PedidoWorkflow workflow(String workflowId) {
        return client.newWorkflowStub(PedidoWorkflow.class,
                WorkflowOptions.newBuilder()
                        .setWorkflowId(workflowId)
                        .setTaskQueue("pedidos")
                        .build());
    }

    private void assertFalseCompensationWasRun() {
        assertTrue(recorder.events().stream().noneMatch(event -> event.startsWith("liberar-")));
    }

    @ComponentScan
    static class Config {}
}
