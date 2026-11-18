package academia.rutaflow.temporal;

import io.temporal.activity.ActivityOptions;
import io.temporal.common.RetryOptions;
import io.temporal.spring.boot.WorkflowImpl;
import io.temporal.workflow.Saga;
import io.temporal.workflow.Workflow;

import java.time.Duration;

@WorkflowImpl(workers = "pedidos")
public class PedidoWorkflowImpl implements PedidoWorkflow {
    private final PedidoActivities activities = Workflow.newActivityStub(
            PedidoActivities.class,
            ActivityOptions.newBuilder()
                    .setStartToCloseTimeout(Duration.ofSeconds(5))
                    .setRetryOptions(RetryOptions.newBuilder()
                            .setInitialInterval(Duration.ofMillis(10))
                            .setMaximumAttempts(3)
                            .build())
                    .build());

    @Override
    public String procesar(String pedidoId, long centavos) {
        Saga saga = new Saga(new Saga.Options.Builder().build());
        try {
            String reserva = activities.reservarInventario(pedidoId);
            saga.addCompensation(activities::liberarInventario, pedidoId);

            String repartidor = activities.asignarRepartidor(pedidoId);
            saga.addCompensation(activities::liberarRepartidor, repartidor);

            activities.cobrar(pedidoId, centavos);
            saga.addCompensation(activities::devolverCobro, pedidoId, centavos);
            activities.notificar(pedidoId);
            return "CONFIRMADO reserva=" + reserva + " repartidor=" + repartidor;
        } catch (Exception falla) {
            saga.compensate();
            throw Workflow.wrap(falla);
        }
    }
}
