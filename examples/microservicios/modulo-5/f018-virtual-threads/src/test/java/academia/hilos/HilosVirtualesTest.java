package academia.hilos;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Duration;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.Test;

class HilosVirtualesTest {

    @Test
    void diezMilEsperasDe100msTerminanEnMenosDeDosSegundos() {
        Duration t = HilosVirtuales.medir(Executors.newVirtualThreadPerTaskExecutor(),
            10_000, Duration.ofMillis(100));
        assertTrue(t.toMillis() < 2_000, "tardó " + t.toMillis() + " ms");
    }

    @Test
    void elPoolFijoSeLimitaPorSuTamanio() {
        // 100 tareas de 100 ms en 10 hilos = 10 tandas => al menos 1000 ms
        Duration t = HilosVirtuales.medir(Executors.newFixedThreadPool(10), 100, Duration.ofMillis(100));
        assertTrue(t.toMillis() >= 1_000, "tardó " + t.toMillis() + " ms");
    }

    @Test
    void elHiloEsVirtual() throws InterruptedException {
        var virtual = new AtomicBoolean();
        Thread.ofVirtual().start(() -> virtual.set(Thread.currentThread().isVirtual())).join();
        assertTrue(virtual.get());
    }

    @Test
    void elSemaforoLimitaLaConcurrencia() {
        assertEquals(10, HilosVirtuales.maximoSimultaneo(300, 10));
    }
}
