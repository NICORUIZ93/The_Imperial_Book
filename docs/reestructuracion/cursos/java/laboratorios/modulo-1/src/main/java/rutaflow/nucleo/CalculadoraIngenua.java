// M1 · laboratorio · la calculadora tal como se escribe la primera vez: cuatro fallos silenciosos.
// Ninguno lanza excepción; las pruebas de CalculadoraIngenuaTest dejan constancia de cada número equivocado.
package rutaflow.nucleo;

public class CalculadoraIngenua {
    /** Fallo 1 (tema 1): int * int se desborda antes de guardarse en long. */
    public static long cargaTotalGramos(int camiones, int gramosPorCamion) {
        return camiones * gramosPorCamion;
    }

    /** Fallo 2 (tema 4): la división entera pierde los decimales antes de convertir a double. */
    public static double kilos(int pesoGramos) {
        return pesoGramos / 1000;
    }

    /** Fallo 3 (tema 4): (int) trunca en vez de redondear. */
    public static int tarifaEnPesos(double tarifaCalculada) {
        return (int) tarifaCalculada;
    }

    /** Fallo 4 (tema 6): el dinero acumulado en double arrastra error binario. */
    public static double recargoAcumulado(int envios) {
        double total = 0;
        for (int i = 0; i < envios; i++) {
            total += 0.10;
        }
        return total;
    }
}
