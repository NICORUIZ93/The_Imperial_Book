package academia.reservas;

import static org.assertj.core.api.Assertions.assertThat;

import io.temporal.client.WorkflowOptions;
import io.temporal.testing.TestWorkflowEnvironment;
import io.temporal.worker.Worker;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Módulo 32 · F182 · La saga con el servidor de Temporal EN MEMORIA (temporal-testing 1.41.1): sin Docker ni CLI.
 * Las actividades son falsas y anotan lo que se llama, para comprobar el orden de las compensaciones.
 */
class ReservaWorkflowTest {

    /** Actividades falsas: «4000-RECHAZAR» falla el cobro; fallarAlConfirmar falla el último paso. */
    static class Falsas implements ReservaActividades {
        final List<String> llamadas = new CopyOnWriteArrayList<>();
        public void reservarPlaza(Reserva r) { llamadas.add("reservarPlaza"); }
        public void liberarPlaza(Reserva r) { llamadas.add("liberarPlaza"); }
        public String cobrar(Reserva r) {
            llamadas.add("cobrar");
            if ("4000-RECHAZAR".equals(r.tarjeta())) throw new PagoRechazado("fondos insuficientes");
            return "CB-" + r.reservaId();
        }
        public void reembolsar(String reservaId, String cobroId) { llamadas.add("reembolsar"); }
        public void confirmar(Reserva r, String cobroId) {
            llamadas.add("confirmar");
            if (r.fallarAlConfirmar()) throw new EventoCerrado();
        }
        public void cancelar(Reserva r, String motivo) { llamadas.add("cancelar"); }
    }

    private TestWorkflowEnvironment env;
    private final Falsas falsas = new Falsas();

    @BeforeEach
    void arrancar() {
        env = TestWorkflowEnvironment.newInstance();
        Worker reservas = env.newWorker("reservas");
        reservas.registerWorkflowImplementationTypes(ReservaWorkflowImpl.class);
        reservas.registerActivitiesImplementations(falsas);
        env.newWorker("cobros").registerActivitiesImplementations(falsas); // la cola del cobro (ADR-0002)
        env.start();
    }

    @AfterEach
    void parar() {
        env.close();
    }

    private ResultadoSaga reservar(Reserva r) {
        return env.getWorkflowClient().newWorkflowStub(ReservaWorkflow.class,
                WorkflowOptions.newBuilder().setTaskQueue("reservas").setWorkflowId("reserva-" + r.reservaId()).build()).reservar(r);
    }

    @Test
    void caminoFeliz() {
        ResultadoSaga r = reservar(new Reserva("R-1", "concierto-1", "C-1", 80, "4242-OK", false));
        assertThat(r.estado()).isEqualTo("CONFIRMADA");
        assertThat(falsas.llamadas).containsExactly("reservarPlaza", "cobrar", "confirmar");
    }

    @Test
    void tarjetaRechazadaLiberaLaPlazaSinReintentar() {
        ResultadoSaga r = reservar(new Reserva("R-2", "concierto-1", "C-1", 80, "4000-RECHAZAR", false));
        assertThat(r.estado()).isEqualTo("CANCELADA");
        assertThat(r.motivo()).isEqualTo("tarjeta rechazada: fondos insuficientes");
        assertThat(falsas.llamadas).containsExactly("reservarPlaza", "cobrar", "liberarPlaza", "cancelar");
    }

    @Test
    void falloAlConfirmarCompensaEnOrdenInverso() {
        ResultadoSaga r = reservar(new Reserva("R-3", "concierto-1", "C-1", 80, "4242-OK", true));
        assertThat(r.compensadas()).containsExactly("reembolsar", "liberarPlaza");
    }
}
