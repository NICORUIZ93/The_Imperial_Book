// M0 · Tema 4 · ejemplo realista: cotizador de consola de rutaflow-nucleo en un archivo fuente compacto.
// Java 25. Ejecuta: java -Dstdout.encoding=UTF-8 CotizarEnvio.java Bogotá Medellín 2500
final int BASE_EN_PESOS = 6000;
final int PESOS_POR_KILO = 1800;

int costoEnPesos(int pesoGramos) {
    int kilosEmpezados = (pesoGramos + 999) / 1000;
    return BASE_EN_PESOS + kilosEmpezados * PESOS_POR_KILO;
}

void main(String[] args) {
    if (args.length != 3) {
        IO.println("Uso: java CotizarEnvio.java <origen> <destino> <peso en gramos>");
        System.exit(64);
    }
    String origen = args[0];
    String destino = args[1];
    int pesoGramos = Integer.parseInt(args[2]);

    IO.println("Ruta: " + origen + " → " + destino);
    IO.println("Peso: " + pesoGramos + " g");
    IO.println("Tarifa: $" + costoEnPesos(pesoGramos));
}
