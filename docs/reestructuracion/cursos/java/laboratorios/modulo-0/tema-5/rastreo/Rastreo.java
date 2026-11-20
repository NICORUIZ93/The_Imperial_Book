// M0 · Tema 5 · ejemplo realista: programa de varios archivos lanzado sin compilar a mano (JEP 458, JDK 22).
// El lanzador compila en memoria este archivo y busca Guia.java y Zona.java en esta misma carpeta.
// Java 25. Ejecuta: java -Dstdout.encoding=UTF-8 Rastreo.java RF-000123
public class Rastreo {
    public static void main(String[] args) {
        if (args.length != 1) {
            System.out.println("Uso: java Rastreo.java <número de guía>");
            System.exit(64);
        }
        String numero = args[0];
        if (!Guia.esValida(numero)) {
            System.out.println("Guía inválida: " + numero + " (formato esperado: RF-000000)");
            System.exit(1);
        }
        System.out.println("Guía " + numero + " · zona " + Zona.deGuia(numero));
    }
}
