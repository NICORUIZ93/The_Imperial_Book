package rutaflow.nucleo;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * M4 · el manifiesto de carga: el MISMO reporte escrito dos veces, con arreglos primero y con
 * ArrayList y HashMap despues. Las dos versiones tienen que dar los mismos numeros; ahi esta la gracia.
 * Las guias siguen el formato «guia|gramos|zona» del modulo 3.
 */
public final class Manifiesto {

    private Manifiesto() {}

    // ------------------------------------------------------------------ con arreglos

    /** Los gramos de cada guia, en el mismo orden. Las malformadas salen como -1. */
    public static int[] gramos(String[] guias) {
        int[] salida = new int[guias.length];
        for (int i = 0; i < guias.length; i++) {
            salida[i] = gramosDe(guias[i]);
        }
        return salida;
    }

    /** Suma ignorando las malformadas. Un arreglo vacio suma 0. */
    public static long suma(int[] gramos) {
        long total = 0;
        for (int g : gramos) {
            if (g >= 0) total += g;
        }
        return total;
    }

    /** El mayor. Con el arreglo vacio no hay maximo: se lanza en vez de inventar un cero. */
    public static int mayor(int[] gramos) {
        if (gramos.length == 0) throw new IllegalArgumentException("manifiesto vacio");
        int m = gramos[0];
        for (int g : gramos) {
            if (g > m) m = g;
        }
        return m;
    }

    /**
     * Cuantas guias pesan MAS que el tope, buscandolo en el arreglo ORDENADO.
     * Es la forma de arreglos: ordenar una copia, buscar con binarySearch y contar el resto.
     */
    public static int sobreElTope(int[] gramos, int tope) {
        int[] utiles = sinMalformados(gramos);
        if (utiles.length == 0) return 0;
        int[] ordenado = utiles.clone();
        Arrays.sort(ordenado);
        int posicion = Arrays.binarySearch(ordenado, tope);
        int primeroMayor = posicion >= 0
                ? primerMayorQue(ordenado, posicion, tope)
                : -posicion - 1;
        return ordenado.length - primeroMayor;
    }

    /** Los que superan el tope, ya ordenados de menos a mas. */
    public static int[] mayoresQue(int[] gramos, int tope) {
        int[] utiles = sinMalformados(gramos);
        int[] ordenado = utiles.clone();
        Arrays.sort(ordenado);
        int desde = 0;
        while (desde < ordenado.length && ordenado[desde] <= tope) {
            desde++;
        }
        return Arrays.copyOfRange(ordenado, desde, ordenado.length);
    }

    // ------------------------------------------------------------------ con colecciones

    /** La misma lectura, pero en una lista que se alarga sola: no hace falta saber cuantas guias hay. */
    public static List<Integer> gramosLista(String[] guias) {
        List<Integer> salida = new ArrayList<>();
        for (String guia : guias) {
            int g = gramosDe(guia);
            if (g >= 0) salida.add(g);
        }
        return salida;
    }

    /** Totales por zona, acumulados con merge: sin la clave no existe todavia y no hay que preguntar. */
    public static java.util.Map<String, Integer> totalesPorZona(String[] guias) {
        java.util.Map<String, Integer> totales = new java.util.HashMap<>();
        for (String guia : guias) {
            String zona = zonaDe(guia);
            int g = gramosDe(guia);
            if (zona == null || g < 0) continue;
            totales.merge(zona, g, Integer::sum);
        }
        return totales;
    }

    /** Filtrar con una lista: se recorre una vez y no hace falta ordenar para contar. */
    public static List<Integer> mayoresQueLista(String[] guias, int tope) {
        List<Integer> salida = new ArrayList<>();
        for (int g : gramosLista(guias)) {
            if (g > tope) salida.add(g);
        }
        return salida;
    }

    // ------------------------------------------------------------------ lectura de la guia

    /** -1 si la guia no trae un numero: igual que en M3, aqui no se lanza. */
    public static int gramosDe(String guia) {
        int barra = guia.indexOf('|');
        if (barra < 0) return -1;
        String resto = guia.substring(barra + 1);
        int fin = resto.indexOf('|');
        String pesos = fin < 0 ? resto : resto.substring(0, fin);
        try {
            return Integer.parseInt(pesos.trim());
        } catch (NumberFormatException e) {
            return -1;
        }
    }

    /** La zona tal cual viene en el texto, o null si la guia no trae tercera parte. */
    public static String zonaDe(String guia) {
        String[] partes = guia.split("\\|");
        return partes.length >= 3 ? partes[2].trim() : null;
    }

    /** Deja fuera las malformadas: un arreglo filtrado, con copyOfRange al final. */
    static int[] sinMalformados(int[] gramos) {
        int buenas = 0;
        for (int g : gramos) {
            if (g >= 0) buenas++;
        }
        int[] salida = new int[buenas];
        int i = 0;
        for (int g : gramos) {
            if (g >= 0) salida[i++] = g;
        }
        return salida;
    }

    /** binarySearch no promete CUAL igualdad devuelve: se retrocede hasta la primera mayor que el tope. */
    private static int primerMayorQue(int[] ordenado, int posicionDeIgual, int tope) {
        int i = posicionDeIgual;
        while (i >= 0 && ordenado[i] > tope) i--;
        return i + 1;
    }

    // ------------------------------------------------------------------ el reporte

    public static void main(String[] args) {
        String[] tanda = {
            "RF-001|1250|NORTE",
            "RF-002|3400|OCCIDENTE",
            "RF-003|sin peso|CARIBE",
            "RF-004|890|SUR",
            "RF-005|700|NORTE",
            "RF-006|2100|CENTRO",
        };
        int tope = args.length > 0 ? Integer.parseInt(args[0]) : 1000;

        int[] gramos = gramos(tanda);
        System.out.println("manifiesto con arreglos:");
        System.out.println("  gramos leidos         : " + Arrays.toString(gramos));
        System.out.println("  sin las malformadas   : " + Arrays.toString(sinMalformados(gramos)));
        System.out.println("  suma                  : " + suma(gramos));
        System.out.println("  mayor                 : " + mayor(gramos));
        System.out.println("  sobre el tope " + tope + "  : " + Arrays.toString(mayoresQue(gramos, tope))
                + " · contando con binarySearch: " + sobreElTope(gramos, tope));

        List<Integer> lista = gramosLista(tanda);
        System.out.println("manifiesto con colecciones:");
        System.out.println("  lista de gramos       : " + lista);
        System.out.println("  suma                  : " + lista.stream().mapToLong(Integer::intValue).sum());
        System.out.println("  mayor                 : " + java.util.Collections.max(lista));
        System.out.println("  sobre el tope " + tope + "  : " + mayoresQueLista(tanda, tope)
                + " · cantidad: " + mayoresQueLista(tanda, tope).size());
        System.out.println("  totales por zona      : " + totalesOrdenados(tanda));

        boolean coinciden = suma(gramos) == lista.stream().mapToLong(Integer::intValue).sum()
                && sobreElTope(gramos, tope) == mayoresQueLista(tanda, tope).size();
        System.out.println("las dos versiones cuadran: " + coinciden);
    }

    /** Los totales por zona impresos en orden alfabetico, para que la salida sea siempre la misma. */
    static String totalesOrdenados(String[] guias) {
        java.util.Map<String, Integer> crudos = totalesPorZona(guias);
        List<String> claves = new ArrayList<>(crudos.keySet());
        java.util.Collections.sort(claves);
        StringBuilder sb = new StringBuilder("{");
        for (int i = 0; i < claves.size(); i++) {
            if (i > 0) sb.append(", ");
            sb.append(claves.get(i)).append('=').append(crudos.get(claves.get(i)));
        }
        return sb.append('}').toString();
    }
}
