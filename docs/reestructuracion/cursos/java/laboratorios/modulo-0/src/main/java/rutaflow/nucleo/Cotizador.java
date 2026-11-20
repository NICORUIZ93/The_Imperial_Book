// M0 · Tema 7 · punto de entrada de rutaflow-nucleo.
// Ejecuta: ./gradlew run --args="Bogotá Medellín 2500"
package rutaflow.nucleo;

public class Cotizador {
    public static void main(String[] args) {
        if (args.length != 3) {
            System.out.println("Uso: cotizador <origen> <destino> <peso en gramos>");
            System.exit(64);
        }
        int pesoGramos = Integer.parseInt(args[2]);
        System.out.println("Ruta: " + args[0] + " → " + args[1]);
        System.out.println("Peso: " + pesoGramos + " g");
        System.out.println("Tarifa: $" + Tarifa.costoEnPesos(pesoGramos));
    }
}
