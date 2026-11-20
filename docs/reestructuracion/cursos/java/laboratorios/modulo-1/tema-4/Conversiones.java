// M1 · Tema 4 · ejemplo mínimo: ensanchar es automático, estrechar exige casting y puede perder.
// Java 25. Ejecuta: java -Dstdout.encoding=UTF-8 Conversiones.java
public class Conversiones {
    public static void main(String[] args) {
        // Ensanchamiento: automático.
        int gramos = 2500;
        long gramosLargos = gramos;
        double gramosDecimales = gramos;
        System.out.println("ensanchar: " + gramosLargos + " · " + gramosDecimales);

        // Ensanchar también puede perder precisión: float solo tiene 24 bits para los dígitos.
        int exacto = 16_777_217;
        float aproximado = exacto;
        System.out.println("int " + exacto + " → float " + aproximado + " → int " + (int) aproximado);
        long muyExacto = 9_007_199_254_740_993L;
        double casi = muyExacto;
        System.out.println("long " + muyExacto + " → double → long " + (long) casi);

        // Estrechamiento: hay que pedirlo con (tipo).
        System.out.println("(int) 3.99 = " + (int) 3.99 + " · (int) -3.99 = " + (int) -3.99);
        System.out.println("(byte) 200 = " + (byte) 200 + " · (byte) 128 = " + (byte) 128);
        System.out.println("(int) 3_000_000_000L = " + (int) 3_000_000_000L);
        System.out.println("(int) 1e20 = " + (int) 1e20 + " · (int) NaN = " + (int) Double.NaN);
        System.out.println("(char) 65 = " + (char) 65 + " · (int) 'ñ' = " + (int) 'ñ');

        // Promoción numérica: byte, short y char se convierten en int antes de operar.
        byte a = 10;
        byte b = 20;
        int suma = a + b;            // byte + byte da int
        System.out.println("byte + byte = " + suma + " · 'a' + 1 = " + ('a' + 1) + " · 5 / 2 = " + 5 / 2
                + " · 5 / 2.0 = " + 5 / 2.0);
    }
}
