package rutaflow.nucleo;

/**
 * M3 · el motor de despacho: decide tarifa, zona y tanda usando solo lo del modulo.
 * Sin colecciones ni objetos de dominio complejos: aqui se ejercita el control de flujo y la forma
 * de los metodos. Las guias siguen siendo cadenas «numero|gramos|zona»; el registro tipado llega en M5.
 */
public final class Despachador {

    private Despachador() {}

    /** Tarifa basica por zona, en pesos, como expresion switch con bloque y yield. */
    public static int tarifaBase(Zona zona) {
        // El default NO cubre null: sin el case null, una zona nula revienta antes de llegar a el.
        return switch (zona) {
            case null -> throw new IllegalArgumentException("sin zona");
            case NORTE -> 9000;
            case OCCIDENTE -> {
                int recargoDeMontana = 3400;
                yield 9000 + recargoDeMontana;
            }
            case CARIBE, SUR -> 11500;
            case CENTRO -> 10200;
            default -> throw new IllegalArgumentException("zona sin tarifa: " + zona);
        };
    }

    /** La tarifa final con el descuento por volumen: ternario anidado, no cadena de if. */
    public static int tarifa(int gramos, int envios) {
        int base = gramos <= 1000 ? 9000 : gramos <= 5000 ? 13500 : 19000;
        int multiplicador = envios >= 50 ? 8 : envios >= 10 ? 9 : 10;
        return base * multiplicador / 10;
    }

    /** Sobrecarga que cuenta una tanda de una vez: misma idea, menos argumentos que escribir. */
    public static int tarifa(int gramos) {
        return tarifa(gramos, 1);
    }

    /** Ceros por defecto y un bucle con etiqueta: se sale de la tanda si una guia pesa de mas. */
    public static int guiasAceptadas(String[] guias, int topePorGuia) {
        int aceptadas = 0;
        TANDA:
        for (String guia : guias) {
            int gramos = gramosDe(guia);
            if (gramos < 0) continue;                       // guia malformed: se ignora, no corta la tanda
            if (gramos > topePorGuia) break TANDA;          // el vehiculo ya no admite nada mas
            aceptadas++;
        }
        return aceptadas;
    }

    /** Suma recursiva de la tanda: el caso base es la tanda vacia. */
    public static long sumaGramos(String[] guias, int i) {
        if (i >= guias.length) return 0;
        int gramos = gramosDe(guias[i]);
        return (gramos < 0 ? 0 : gramos) + sumaGramos(guias, i + 1);
    }

    /** varargs para no montar el arreglo antes de llamar. */
    public static long sumaGramos(String... guias) {
        return sumaGramos(guias, 0);
    }

    /** -1 si la guia no trae un numero: el llamador decide, aqui no se lanza. */
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

    public static void main(String[] args) {
        String[] tanda = {
            "RF-001|1250|NORTE",
            "RF-002|3400|OCCIDENTE",
            "RF-003|sin peso|CARIBE",
            "RF-004|890|SUR",
        };
        System.out.println("tarifa base por zona:");
        for (Zona z : Zona.values()) {
            System.out.println("  " + z + " = " + tarifaBase(z));
        }
        System.out.println("guias aceptadas con tope 2000 g: " + guiasAceptadas(tanda, 2000));
        System.out.println("gramos totales de la tanda     : " + sumaGramos(tanda));
        System.out.println("gramos con varargs sueltos     : " + sumaGramos("RF-005|700|NORTE"));
        System.out.println("tarifa(3400 g, 12 envios)      : " + tarifa(3400, 12));
        System.out.println("tarifa(3400 g)                 : " + tarifa(3400));
    }
}
