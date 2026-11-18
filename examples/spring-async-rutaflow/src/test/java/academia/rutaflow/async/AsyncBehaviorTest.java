package academia.rutaflow.async;

import static org.assertj.core.api.Assertions.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.core.task.TaskRejectedException;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

class AsyncBehaviorTest {
    private AnnotationConfigApplicationContext contexto() {
        return new AnnotationConfigApplicationContext(AsyncConfiguration.class, NotificacionService.class);
    }

    @Test
    void llamadaExternaCambiaDeHilo() throws Exception {
        try (var context = contexto()) {
            var service = context.getBean(NotificacionService.class);
            assertThat(service.enviar("ENV-42").get(5, TimeUnit.SECONDS)).startsWith("notif-");
        }
    }

    @Test
    void autoInvocacionConservaElHiloActual() throws Exception {
        try (var context = contexto()) {
            var service = context.getBean(NotificacionService.class);
            assertThat(service.enviarDesdeDentro("ENV-42").get(5, TimeUnit.SECONDS))
                    .isEqualTo(Thread.currentThread().getName());
        }
    }

    @Test
    void errorDelTrabajoLlegaPorElFuture() {
        try (var context = contexto()) {
            var service = context.getBean(NotificacionService.class);
            CompletableFuture<String> result = service.enviar("");
            assertThatThrownBy(() -> result.get(5, TimeUnit.SECONDS))
                    .isInstanceOf(ExecutionException.class)
                    .hasCauseInstanceOf(IllegalArgumentException.class);
        }
    }

    @Test
    void dosActivasUnaEnColaYLaCuartaSeRechaza() throws Exception {
        CountDownLatch dentro = new CountDownLatch(2);
        CountDownLatch liberar = new CountDownLatch(1);
        try (var context = contexto()) {
            var executor = context.getBean("notificaciones", ThreadPoolTaskExecutor.class);
            Runnable bloquear = () -> {
                dentro.countDown();
                try {
                    if (!liberar.await(5, TimeUnit.SECONDS)) throw new IllegalStateException("No se liberó la prueba");
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new IllegalStateException(e);
                }
            };
            try {
                Future<?> primera = executor.submit(bloquear);
                Future<?> segunda = executor.submit(bloquear);
                assertThat(dentro.await(5, TimeUnit.SECONDS)).isTrue();
                Future<?> tercera = executor.submit(() -> {});
                assertThat(executor.getThreadPoolExecutor().getQueue()).hasSize(1);
                assertThatThrownBy(() -> context.getBean(NotificacionService.class).enviar("ENV-4"))
                        .isInstanceOf(TaskRejectedException.class);
                liberar.countDown();
                primera.get(5, TimeUnit.SECONDS);
                segunda.get(5, TimeUnit.SECONDS);
                tercera.get(5, TimeUnit.SECONDS);
            } finally {
                liberar.countDown();
            }
        }
    }
}
