// M0 · Tema 6 · el mismo programa después de depurarlo: se multiplica antes de dividir.
// Java 25. Ejecuta: java PesoVolumetricoCorregido.java
public class PesoVolumetricoCorregido {
    static int volumetricoEnGramos(int largoCm, int anchoCm, int altoCm) {
        int volumenCm3 = largoCm * anchoCm * altoCm;
        return volumenCm3 * 1000 / 5000;
    }

    static int facturableEnGramos(int pesoRealGramos, int volumetricoGramos) {
        return Math.max(pesoRealGramos, volumetricoGramos);
    }

    public static void main(String[] args) {
        int volumetrico = volumetricoEnGramos(30, 20, 15);
        int facturable = facturableEnGramos(1200, volumetrico);
        System.out.println("volumétrico: " + volumetrico + " g");
        System.out.println("facturable:  " + facturable + " g");
    }
}
