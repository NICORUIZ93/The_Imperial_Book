// M2 · laboratorio · rutaflow-nucleo: lee guías por la entrada estándar hasta el fin de la entrada.
// Ejecutar en seco   : java -Dstdout.encoding=UTF-8 -cp <classpath> rutaflow.nucleo.LectorDeGuias < tema-6/datos/guias.txt
// Ejecutar con Gradle: ./gradlew -q --console=plain run < tema-6/datos/guias.txt   (el build enruta la entrada estándar)
package rutaflow.nucleo;

public class LectorDeGuias {

    public static void main(String[] args) {
        int leidas = 0;
        int validas = 0;
        long pesoTotal = 0;
        StringBuilder informe = new StringBuilder();

        String linea;
        while ((linea = IO.readln()) != null) {
            leidas++;
            String motivo = GuiaDeEnvio.motivoDeRechazo(linea);
            if (motivo != null) {
                informe.append("  línea ").append(leidas).append(": ").append(motivo).append('\n');
                continue;
            }
            GuiaDeEnvio guia = GuiaDeEnvio.desdeLinea(linea);
            validas++;
            pesoTotal += guia.pesoGramos();
            System.out.println("  ok  " + guia.enLinea());
        }

        System.out.println("fin de la entrada : readln() devolvió null tras " + leidas + " lecturas");
        System.out.println("válidas           : " + validas + " · descartadas: " + (leidas - validas));
        System.out.println("peso acumulado    : " + pesoTotal + " g");
        System.out.print(informe);
    }
}
