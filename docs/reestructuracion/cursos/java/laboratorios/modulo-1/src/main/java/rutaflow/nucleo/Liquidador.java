// M1 · laboratorio · punto de entrada: liquida un envío con la calculadora corregida.
// Ejecuta: ./gradlew run --args="2500"
package rutaflow.nucleo;

public class Liquidador {
    public static void main(String[] args) {
        if (args.length != 1) {
            System.out.println("Uso: liquidador <peso en gramos>");
            System.exit(64);
        }
        int pesoGramos = Integer.parseInt(args[0]);
        int costo = CalculadoraDeTarifas.costoEnPesos(pesoGramos);
        System.out.println("Peso: " + pesoGramos + " g (" + CalculadoraDeTarifas.kilos(pesoGramos) + " kg)");
        System.out.println("Flete: $" + costo);
        System.out.println("Total con IVA: $" + CalculadoraDeTarifas.totalConIva(costo));
    }
}
