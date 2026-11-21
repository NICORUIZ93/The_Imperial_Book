// tema-5/errores/ConversionYTipo.java — «%d» no acepta double: el tipo de la conversión y del argumento deben coincidir.
// Ejecutar: javac --release 25 -d out tema-5/errores/ConversionYTipo.java && java -cp out ConversionYTipo
public class ConversionYTipo {

    public static void main(String[] args) {
        double costo = 11400.0;
        System.out.printf("costo: %d%n", costo);
    }
}
