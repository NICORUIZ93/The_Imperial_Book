// M1 · Tema 1 · ejemplo realista: el peso total del día se desborda en int y nadie avisa.
// Java 25. Ejecuta: java -Dstdout.encoding=UTF-8 CargaDelDia.java
public class CargaDelDia {
    public static void main(String[] args) {
        int camiones = 1_500;
        int gramosPorCamion = 2_000_000;   // 2 toneladas

        // ANTES: int * int = int. El resultado real (3 000 000 000) no cabe en 32 bits.
        int totalMal = camiones * gramosPorCamion;
        System.out.println("ANTES   total en int:        " + totalMal + " g");

        // Diagnóstico: la versión exacta de la misma cuenta lanza una excepción en vez de callar.
        try {
            Math.multiplyExact(camiones, gramosPorCamion);
        } catch (ArithmeticException e) {
            System.out.println("        multiplyExact dice:  " + e.getMessage());
        }

        // DESPUÉS: basta con que un operando sea long para que la cuenta se haga en 64 bits.
        long totalBien = (long) camiones * gramosPorCamion;
        System.out.println("DESPUÉS total en long:       " + totalBien + " g");

        // Trampa: convertir después de multiplicar ya es tarde.
        long tarde = camiones * gramosPorCamion;
        System.out.println("TRAMPA  long x = int * int:  " + tarde + " g");
    }
}
