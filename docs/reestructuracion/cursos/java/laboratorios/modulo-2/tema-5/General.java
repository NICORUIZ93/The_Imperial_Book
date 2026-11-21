// tema-5/General.java — %g (el formato «general», que sí existe en Java) y el recorte de ceros en BigDecimal.
// Ejecutar: javac --release 25 -encoding UTF-8 -d out tema-5/General.java && java -Dstdout.encoding=UTF-8 -cp out General
import java.math.BigDecimal;

public class General {

    static final double[] VALORES = {1.5, 0.00015, 0.000015, 123456.7, 1234567.0, 100.0, 0.0};

    public static void main(String[] args) {
        System.out.println("--- %g no es un error: es el formato general de Java ---");
        for (double d : VALORES) {
            System.out.printf("%-11s -> %-14s -> %s%n", d, String.format("%g", d), String.format("%.2f", d));
        }
        System.out.println("--- dinero: tres formas de imprimir 11400.00 ---");
        BigDecimal conCeros = new BigDecimal("11400.00");
        BigDecimal sinCeros = conCeros.stripTrailingZeros();
        System.out.println("double  con %.2f      : " + String.format("%.2f", 11400.00));
        System.out.println("BigDecimal tal cual    : " + conCeros);
        System.out.println("BigDecimal stripping   : " + sinCeros);
        System.out.println("stripping + plain      : " + sinCeros.toPlainString());
        System.out.println("stripping + %s a secas : " + String.format("%s", sinCeros));
    }
}
