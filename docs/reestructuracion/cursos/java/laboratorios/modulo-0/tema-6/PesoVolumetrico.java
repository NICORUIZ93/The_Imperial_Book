// M0 · Tema 6 · ejemplo realista: el programa tiene un fallo que se encuentra con el depurador.
// Un paquete de 30 × 20 × 15 cm y 1200 g debe facturarse por su peso volumétrico: 1800 g.
// Java 25. Ejecuta: java PesoVolumetrico.java
public class PesoVolumetrico {
    // Peso volumétrico en gramos: volumen en cm³ dividido entre 5000 da kilogramos.
    static int volumetricoEnGramos(int largoCm, int anchoCm, int altoCm) {
        int volumenCm3 = largoCm * anchoCm * altoCm;
        int kilos = volumenCm3 / 5000;
        int gramos = kilos * 1000;
        return gramos;
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
