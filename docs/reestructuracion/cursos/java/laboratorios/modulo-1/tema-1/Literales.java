// M1 · Tema 1 · literales: bases, separadores, sufijos y char como número.
// Java 25. Ejecuta: java -Dstdout.encoding=UTF-8 Literales.java
public class Literales {
    public static void main(String[] args) {
        int decimal = 1_000_000;
        int hexadecimal = 0xFF;
        int binario = 0b1010;
        int octal = 010;                 // ¡empieza por 0: es octal, vale 8!
        long grande = 3_000_000_000L;    // sin la L no compila
        float precio = 19.99f;           // sin la f es double
        double avogadro = 6.022e23;

        System.out.println(decimal + " " + hexadecimal + " " + binario + " " + octal);
        System.out.println(grande + " " + precio + " " + avogadro);

        char letra = 'A';
        char enie = 'ñ';
        char porCodigo = 'ñ';       // la misma ñ, escrita con su código
        System.out.println(letra + " vale " + (int) letra + " · " + enie + " vale " + (int) enie
                + " · iguales: " + (enie == porCodigo));
        System.out.println("'A' + 1 = " + (letra + 1) + " · (char) ('A' + 1) = " + (char) (letra + 1));

        // char es una unidad UTF-16 de 16 bits: un emoji no cabe en una.
        String caja = "📦";
        System.out.println("\"📦\".length() = " + caja.length()
                + " · code points = " + caja.codePointCount(0, caja.length())
                + " · U+" + Integer.toHexString(caja.codePointAt(0)).toUpperCase());
        System.out.println("unidades: " + Integer.toHexString(caja.charAt(0)) + " " + Integer.toHexString(caja.charAt(1)));
    }
}
