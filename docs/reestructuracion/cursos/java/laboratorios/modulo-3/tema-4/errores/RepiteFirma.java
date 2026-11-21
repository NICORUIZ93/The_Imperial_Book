// M3 · Tema 4 · el tipo de retorno no forma parte de la firma: no se puede sobrecargar por ahi.
// Java 25. Ejecuta: javac --release 25 -d out RepiteFirma.java   (debe fallar)
public class RepiteFirma {
    static int tarifa(int gramos) { return 9000; }

    // Mismo nombre, mismos parametros: solo cambia lo que devuelve.
    static double tarifa(int gramos) { return 9000.0; }

    public static void main(String[] args) {
        System.out.println(tarifa(800));
    }
}
