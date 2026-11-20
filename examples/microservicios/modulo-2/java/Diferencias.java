// Módulo 0.3 · Java y Node.js lado a lado: tipos, errores y concurrencia
// Tres diferencias de fondo entre Java y Node.js, en un solo programa. Compáralo con node/diferencias.js.
// Requisitos: JDK 25 LTS (los hilos virtuales existen desde JDK 21). Sin dependencias.
// Ejecuta (desde la carpeta java/):  java Diferencias.java

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class Diferencias {

    // 1. TIPOS ESTÁTICOS: el compilador revisa los tipos ANTES de ejecutar.
    //    Si escribes sumar("2", 2), el programa ni siquiera arranca (error de compilación).
    static int sumar(int a, int b) {
        return a + b;
    }

    // 2. ERRORES: Java lanza excepciones con tipo; puedes atrapar exactamente la que esperas.
    static String convertir(String texto) {
        try {
            return "número " + Integer.parseInt(texto);
        } catch (NumberFormatException e) {
            return "error: '" + texto + "' no es un número";
        }
    }

    // 3. CONCURRENCIA: Java usa hilos. Un hilo virtual es barato: puedes crear miles.
    //    Tres tareas de 1 segundo, cada una en su hilo, terminan juntas en ~1 segundo.
    static long tresTareasEnParalelo() throws Exception {
        Instant inicio = Instant.now();
        try (var ejecutor = Executors.newVirtualThreadPerTaskExecutor()) {
            List<Future<String>> futuros = new ArrayList<>();
            for (int i = 1; i <= 3; i++) {
                int n = i;
                futuros.add(ejecutor.submit(() -> {
                    Thread.sleep(1000); // simula esperar a una base de datos
                    return "tarea " + n;
                }));
            }
            for (Future<String> f : futuros) {
                f.get(); // espera el resultado de cada tarea
            }
        }
        return Duration.between(inicio, Instant.now()).toMillis();
    }

    public static void main(String[] args) throws Exception {
        System.out.println("1) sumar(2, 2) = " + sumar(2, 2));
        System.out.println("2) " + convertir("42") + " | " + convertir("cuarenta"));
        long ms = tresTareasEnParalelo();
        System.out.println("3) tres tareas de 1 s en hilos virtuales tardaron menos de 1.5 s: " + (ms < 1500));
    }
}
