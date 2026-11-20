package academia.reservas;

import io.temporal.workflow.WorkflowInterface;
import io.temporal.workflow.WorkflowMethod;

/** Módulo 32 · F182 · Contrato del workflow de la saga de reservas. */
@WorkflowInterface
public interface ReservaWorkflow {
    @WorkflowMethod
    ResultadoSaga reservar(Reserva reserva);
}
