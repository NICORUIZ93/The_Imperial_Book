// M1 · Tema 3 · ejemplo realista: variables bien delimitadas en el resumen de una ruta.
// Java 25. Ejecuta: java -Dstdout.encoding=UTF-8 ResumenDeRuta.java
public class ResumenDeRuta {
    static final int TOPE_GRAMOS = 30_000;   // constante de la clase: un solo lugar para la regla
    static int paquetes = 3;                 // campo: tiene valor por defecto si no se inicializa

    public static void main(String[] args) {
        var origen = "Bogotá";                 // String
        var distanciaKm = 415;                 // int
        var horas = 8.5;                       // double
        var cargaGramos = 12_000_000_000L;     // long (por el sufijo L)

        // Asignación definitiva: el compilador comprueba que TODOS los caminos dan valor antes de usarla.
        final String categoria;
        if (distanciaKm > 300) {
            categoria = "larga distancia";
        } else {
            categoria = "regional";
        }

        // Sombreado: una variable local puede tapar a un campo con el mismo nombre.
        int paquetes = 40;
        System.out.println("local: " + paquetes + " · campo: " + ResumenDeRuta.paquetes);

        System.out.println(origen + " · " + distanciaKm + " km · " + horas + " h · " + categoria);
        System.out.println("velocidad media: " + distanciaKm / horas + " km/h");
        System.out.println("carga: " + cargaGramos / 1_000_000 + " t · tope por paquete: " + TOPE_GRAMOS + " g");
    }
}
