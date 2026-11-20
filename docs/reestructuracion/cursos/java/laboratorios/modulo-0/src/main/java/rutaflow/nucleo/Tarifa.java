// M0 · Tema 7 · la regla de tarifa de rutaflow-nucleo, ahora dentro de un proyecto Gradle.
// La línea «package» dice en qué carpeta vive el archivo; los paquetes se estudian en M5.
package rutaflow.nucleo;

public class Tarifa {
    static final int BASE_EN_PESOS = 6000;
    static final int PESOS_POR_KILO = 1800;

    /** Base fija más un valor por cada kilogramo empezado. */
    public static int costoEnPesos(int pesoGramos) {
        if (pesoGramos <= 0) {
            throw new IllegalArgumentException("el peso debe ser mayor que 0 g: " + pesoGramos);
        }
        int kilosEmpezados = (pesoGramos + 999) / 1000;
        return BASE_EN_PESOS + kilosEmpezados * PESOS_POR_KILO;
    }
}
