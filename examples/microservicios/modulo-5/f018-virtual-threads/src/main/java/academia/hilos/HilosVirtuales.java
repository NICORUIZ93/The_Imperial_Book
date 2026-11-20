package academia.hilos;

import java.time.Duration;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Semaphore;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.IntStream;

/**
 * F018 · Virtual Threads (Project Loom). Compara un pool fijo de hilos de plataforma
 * con un hilo virtual por tarea cuando las tareas pasan casi todo el tiempo esperando E/S.
 * Ejecuta: java src/main/java/academia/hilos/HilosVirtuales.java
 */
public class HilosVirtuales {

    /** Simula una llamada remota (BD, HTTP) que tarda 'espera' sin usar CPU. */
    static int llamadaRemota(int id, Duration espera) throws InterruptedException {
        Thread.sleep(espera);           // el hilo virtual se "desmonta" aquí y libera su carrier
        return id;
    }

    /** Lanza 'tareas' llamadas en el executor y devuelve cuánto tardaron todas. */
    static Duration medir(ExecutorService executor, int tareas, Duration espera) {
        long inicio = System.nanoTime();
        try (executor) {                // close() espera a que terminen todas las tareas
            IntStream.range(0, tareas).forEach(i ->
                executor.submit(() -> llamadaRemota(i, espera)));
        }
        return Duration.ofNanos(System.nanoTime() - inicio);
    }

    /**
     * Con hilos virtuales la concurrencia ya no la limita el pool:
     * si el recurso de abajo es escaso (p. ej. 10 conexiones de BD), límitalo tú.
     */
    static int maximoSimultaneo(int tareas, int permisos) {
        var semaforo = new Semaphore(permisos);
        var dentro = new AtomicInteger();
        var maximo = new AtomicInteger();
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < tareas; i++) {
                executor.submit(() -> {
                    semaforo.acquire();
                    try {
                        maximo.accumulateAndGet(dentro.incrementAndGet(), Math::max);
                        Thread.sleep(Duration.ofMillis(20));
                    } finally {
                        dentro.decrementAndGet();
                        semaforo.release();
                    }
                    return null;
                });
            }
        }
        return maximo.get();
    }

    public static void main(String[] args) throws Exception {
        int tareas = 1_000;
        var espera = Duration.ofMillis(200);

        Duration plataforma = medir(Executors.newFixedThreadPool(50), tareas, espera);
        System.out.printf("Plataforma (pool de 50): %d tareas en %d ms%n", tareas, plataforma.toMillis());

        Duration virtuales = medir(Executors.newVirtualThreadPerTaskExecutor(), tareas, espera);
        System.out.printf("Virtuales (1 por tarea): %d tareas en %d ms%n", tareas, virtuales.toMillis());

        Thread hilo = Thread.ofVirtual().name("pedido-42").start(() ->
            System.out.println("¿Virtual? " + Thread.currentThread().isVirtual()
                + " · nombre=" + Thread.currentThread().getName()));
        hilo.join();

        System.out.println("Máximo simultáneo con Semaphore(10): " + maximoSimultaneo(500, 10));
    }
}
