package academia.reservas;

import io.temporal.activity.ActivityOptions;
import io.temporal.common.RetryOptions;
import io.temporal.failure.ActivityFailure;
import io.temporal.failure.TemporalFailure;
import io.temporal.workflow.Saga;
import io.temporal.workflow.Workflow;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * Módulo 32 · F182 · La saga: reservar plaza -> cobrar (cola «cobros») -> confirmar; si algo falla, compensa en orden
 * inverso. Código determinista: nada de red, reloj del sistema ni aleatorios aquí (eso va en las actividades).
 */
public class ReservaWorkflowImpl implements ReservaWorkflow {

    private static final RetryOptions REINTENTOS = RetryOptions.newBuilder()
            .setInitialInterval(Duration.ofMillis(200)).setBackoffCoefficient(2).setMaximumInterval(Duration.ofSeconds(5))
            .setMaximumAttempts(8).setDoNotRetry("academia.reservas.SinPlazas", "academia.reservas.PagoRechazado", "academia.reservas.EventoCerrado")
            .build();

    private final ReservaActividades act = Workflow.newActivityStub(ReservaActividades.class,
            ActivityOptions.newBuilder().setStartToCloseTimeout(Duration.ofSeconds(10)).setRetryOptions(REINTENTOS).build());

    // El cobro va a su propia cola para limitar su ritmo sin frenar lo demás (ADR-0002). Sin límite de intentos:
    // manda el ScheduleToCloseTimeout (10 minutos en total, contando la espera en la cola).
    private final ReservaActividades pagos = Workflow.newActivityStub(ReservaActividades.class,
            ActivityOptions.newBuilder().setTaskQueue("cobros").setStartToCloseTimeout(Duration.ofSeconds(10))
                    .setScheduleToCloseTimeout(Duration.ofMinutes(10))
                    .setRetryOptions(RetryOptions.newBuilder(REINTENTOS).setMaximumAttempts(0).build()).build());

    @Override
    public ResultadoSaga reservar(Reserva r) {
        Saga saga = new Saga(new Saga.Options.Builder().setParallelCompensation(false).build());
        List<String> compensadas = new ArrayList<>();
        try {
            act.reservarPlaza(r);
            saga.addCompensation(() -> { act.liberarPlaza(r); compensadas.add("liberarPlaza"); });
            String cobroId = pagos.cobrar(r);
            saga.addCompensation(() -> { pagos.reembolsar(r.reservaId(), cobroId); compensadas.add("reembolsar"); });
            act.confirmar(r, cobroId);
            return new ResultadoSaga(r.reservaId(), "CONFIRMADA", null, List.of());
        } catch (ActivityFailure e) {
            // El motivo real va en la causa (ApplicationFailure); getOriginalMessage() es el texto de la excepción original.
            String motivo = e.getCause() instanceof TemporalFailure causa ? causa.getOriginalMessage() : e.getMessage();
            saga.compensate(); // orden inverso: la última compensación registrada se ejecuta primero
            act.cancelar(r, motivo);
            return new ResultadoSaga(r.reservaId(), "CANCELADA", motivo, compensadas);
        }
    }
}
