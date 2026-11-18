package academia.rutaflow.scheduling;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.scheduling.config.ScheduledTaskHolder;

@SpringBootTest(properties = {
    "app.revision.delay-ms=3600000",
    "app.revision.initial-delay-ms=3600000"
})
class PedidosSchedulerTest {
    @Autowired ScheduledTaskHolder scheduledTasks;
    @Autowired PedidosScheduler scheduler;
    @Autowired RevisionPedidos revision;

    @Test
    void registraUnaTareaYElMetodoDelegaSinEsperarAlReloj() {
        assertThat(scheduledTasks.getScheduledTasks()).hasSize(1);

        scheduler.revisarPendientes();

        assertThat(revision.ejecuciones()).isEqualTo(1);
    }
}
