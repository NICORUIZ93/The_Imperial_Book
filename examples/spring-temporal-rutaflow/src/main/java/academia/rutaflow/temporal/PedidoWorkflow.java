package academia.rutaflow.temporal;

import io.temporal.workflow.WorkflowInterface;
import io.temporal.workflow.WorkflowMethod;

@WorkflowInterface
public interface PedidoWorkflow {
    @WorkflowMethod
    String procesar(String pedidoId, long centavos);
}
