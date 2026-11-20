// M1 · Tema 3 · ejemplo mínimo: declarar, inicializar, ámbito de bloque, final y var.
// Java 25. Ejecuta: java -Dstdout.encoding=UTF-8 Ambito.java
public class Ambito {
    public static void main(String[] args) {
        int pesoGramos;              // declarada, todavía sin valor
        pesoGramos = 2500;           // primera asignación
        final int TOPE_GRAMOS = 30_000;
        var destino = "Medellín";    // el compilador deduce String

        {
            int recargo = 500;       // solo existe dentro de estas llaves
            pesoGramos = pesoGramos + recargo;
        }
        // System.out.println(recargo);   // no compila: recargo ya no existe

        System.out.println(destino + ": " + pesoGramos + " g de un tope de " + TOPE_GRAMOS + " g");
    }
}
