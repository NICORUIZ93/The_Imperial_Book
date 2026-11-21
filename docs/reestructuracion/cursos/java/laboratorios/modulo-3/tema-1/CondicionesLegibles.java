// M3 · Tema 1 · ejemplo realista: extraer la condicion en un metodo con nombre.
// Java 25. Ejecuta: java -Dstdout.encoding=UTF-8 CondicionesLegibles.java
public class CondicionesLegibles {
    static boolean esCargaDemasiadoPesada(int pesoGramos) {
        return pesoGramos > 5000;
    }

    static boolean requiereCotizacionEspecial(String destino, int pesoGramos) {
        boolean caribe = destino.equals("Barranquilla") || destino.equals("Cartagena");
        boolean pesado = pesoGramos > 3000;
        return caribe && pesado;
    }

    // Morgan: !(a && b) == (!a || !b). Se comprueba con las cuatro combinaciones.
    static boolean noAmbas(boolean a, boolean b) { return !(a && b); }
    static boolean algunaFalsa(boolean a, boolean b) { return !a || !b; }

    public static void main(String[] args) {
        String[] destinos = {"Bogotá", "Barranquilla"};
        int[] pesos = {1200, 3400};
        for (String d : destinos) {
            for (int p : pesos) {
                System.out.printf("%-13s %5d g  especial=%s pesada=%s%n",
                    d, p, requiereCotizacionEspecial(d, p), esCargaDemasiadoPesada(p));
            }
        }
        System.out.println();
        for (boolean a : new boolean[] {true, false}) {
            for (boolean b : new boolean[] {true, false}) {
                System.out.println("a=" + a + " b=" + b + "  !(a&&b)=" + noAmbas(a, b) + "  (!a||!b)=" + algunaFalsa(a, b)
                    + "  coinciden=" + (noAmbas(a, b) == algunaFalsa(a, b)));
            }
        }
    }
}
