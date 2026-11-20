// M1 · Tema 4 · ejemplo realista: tres conversiones del cotizador que dan un número equivocado sin avisar.
// Java 25. Ejecuta: java -Dstdout.encoding=UTF-8 ConvertirPeso.java
public class ConvertirPeso {
    public static void main(String[] args) {
        int pesoGramos = 2500;
        int paquetes = 3;
        int pesoTotalGramos = 7600;

        // 1. División entera: el decimal desaparece antes de llegar al double.
        double kilosMal = pesoGramos / 1000;
        double kilosBien = pesoGramos / 1000.0;
        System.out.println("kilos:    mal " + kilosMal + " · bien " + kilosBien);

        // 2. Promedio: el casting debe ir sobre un operando, no sobre el resultado.
        double promedioMal = (double) (pesoTotalGramos / paquetes);
        double promedioBien = (double) pesoTotalGramos / paquetes;
        System.out.println("promedio: mal " + promedioMal + " · bien " + promedioBien);

        // 3. Volver a entero: (int) trunca; Math.round redondea al más cercano.
        double tarifa = 11399.6;
        System.out.println("tarifa:   (int) " + (int) tarifa + " · Math.round " + Math.round(tarifa));

        // 4. De long a int sin sorpresas: toIntExact falla en vez de recortar bits.
        long cargaGramos = 3_000_000_000L;
        System.out.println("recorte:  (int) " + (int) cargaGramos);
        System.out.println("exacto:   " + Math.toIntExact(cargaGramos));
    }
}
