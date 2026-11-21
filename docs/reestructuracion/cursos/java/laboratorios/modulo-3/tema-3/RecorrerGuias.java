// M3 · Tema 3 · Los cuatro lazos de Java recorriendo la misma tanda de envios.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out RecorrerGuias
public class RecorrerGuias {
    // Pesos en gramos de una tanda de envios, en el orden en que llegaron al almacen.
    static final int[] PESOS = {1250, 3400, 890, 7600, 250};

    static int totalWhile() {
        int i = 0, suma = 0;
        while (i < PESOS.length) { suma += PESOS[i]; i++; }
        return suma;
    }

    static int totalFor() {
        int suma = 0;
        for (int i = 0; i < PESOS.length; i++) suma += PESOS[i];
        return suma;
    }

    static int totalForEach() {
        int suma = 0;
        for (int p : PESOS) suma += p;
        return suma;
    }

    static int contadorHastaCero() {
        int veces = 0, restante = PESOS.length;
        do { restante--; veces++; } while (restante > 0);
        return veces;
    }

    static String primeroPesado() {
        for (int p : PESOS) if (p >= 3000) return "la guia con " + p + " g es la numero " + (indiceDe(p) + 1);
        return "ninguno";
    }

    static int indiceDe(int peso) {
        for (int i = 0; i < PESOS.length; i++) if (PESOS[i] == peso) return i;
        return -1;
    }

    public static void main(String[] args) {
        System.out.println("while    : " + totalWhile() + " g");
        System.out.println("for      : " + totalFor() + " g");
        System.out.println("foreach  : " + totalForEach() + " g");
        System.out.println("do-while : " + contadorHastaCero() + " vueltas para recorrer " + PESOS.length + " guias");
        System.out.println(primeroPesado());

        // Sobre List<Integer> el for-each no indexa: pide un Iterator y desempaqueta en cada vuelta.
        java.util.List<Integer> cajas = java.util.List.of(3, 12, 40, 5);
        int totalCajas = 0;
        for (int c : cajas) totalCajas += c;
        System.out.println("for-each sobre List<Integer>: " + totalCajas + " cajas");

        // La variable del for muere al salir: lo unico que sobrevive es lo declarado fuera.
        int acumulado = 0;
        for (int i = 0; i < PESOS.length; i++) acumulado += PESOS[i];
        System.out.println("fuera del bucle queda: " + acumulado);
    }
}
