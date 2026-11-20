// M1 · Tema 6 · ejemplo realista: sumar dinero en double acumula error; en centavos enteros, no.
// Java 25. Ejecuta: java -Dstdout.encoding=UTF-8 SumaDeTarifas.java
public class SumaDeTarifas {
    public static void main(String[] args) {
        int envios = 1_000_000;

        // ANTES: recargo de 0,10 por envío, acumulado en double.
        double totalDouble = 0;
        for (int i = 0; i < envios; i++) {
            totalDouble += 0.10;
        }

        // DESPUÉS: el mismo recargo en centavos, con long.
        long totalCentavos = 0;
        for (int i = 0; i < envios; i++) {
            totalCentavos += 10;
        }

        System.out.println("ANTES   (double):   " + totalDouble);
        System.out.println("DESPUÉS (centavos): " + totalCentavos / 100 + "," + String.format("%02d", totalCentavos % 100));
        System.out.println("¿coinciden? " + (totalDouble == totalCentavos / 100.0)
                + " · diferencia: " + (totalDouble - totalCentavos / 100.0));

        // float es mucho peor: solo 24 bits de precisión.
        float totalFloat = 0;
        for (int i = 0; i < envios; i++) {
            totalFloat += 0.10f;
        }
        System.out.println("con float:          " + totalFloat);

        // Un bucle controlado por un double puede no terminar donde esperas.
        int vueltas = 0;
        for (double x = 0; x != 1.0 && vueltas < 20; x += 0.1) {
            vueltas++;
        }
        System.out.println("vueltas de 0 a 1.0 con paso 0.1 y «!=»: " + vueltas + " (se detuvo por el tope de 20)");
    }
}
