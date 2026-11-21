// tema-5/errores/ConversionInventada.java — una letra que no es conversión: el error dice cuál.
// Ejecutar: javac --release 25 -d out tema-5/errores/ConversionInventada.java && java -cp out ConversionInventada
public class ConversionInventada {

    public static void main(String[] args) {
        System.out.printf("etiqueta: %q%n", "RF-000123");
    }
}
