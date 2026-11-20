// M1 · laboratorio · la calculadora corregida con lo aprendido en el módulo.
package rutaflow.nucleo;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class CalculadoraDeTarifas {
    static final int BASE_EN_PESOS = 6000;
    static final int PESOS_POR_KILO = 1800;
    static final BigDecimal TASA_IVA = new BigDecimal("0.19");

    /** Tema 1: la cuenta se hace en long y, si aun así no cabe, falla en vez de callar. */
    public static long cargaTotalGramos(int camiones, int gramosPorCamion) {
        return Math.multiplyExact((long) camiones, (long) gramosPorCamion);
    }

    /** Tema 4: basta un operando double para conservar los decimales. */
    public static double kilos(int pesoGramos) {
        return pesoGramos / 1000.0;
    }

    /** Tema 4 y 7: redondeo al entero más cercano, comprobando que cabe en int. */
    public static int tarifaEnPesos(double tarifaCalculada) {
        return Math.toIntExact(Math.round(tarifaCalculada));
    }

    /** Tema 6: el dinero se acumula en centavos enteros. */
    public static long recargoAcumuladoEnCentavos(int envios) {
        return Math.multiplyExact((long) envios, 10L);
    }

    /** Tema 7: base más un valor por kilo empezado. */
    public static int costoEnPesos(int pesoGramos) {
        if (pesoGramos <= 0) {
            throw new IllegalArgumentException("el peso debe ser mayor que 0 g: " + pesoGramos);
        }
        return Math.addExact(BASE_EN_PESOS, Math.multiplyExact(Math.ceilDiv(pesoGramos, 1000), PESOS_POR_KILO));
    }

    /** Tema 7: el IVA se calcula con BigDecimal y redondeo declarado. */
    public static BigDecimal totalConIva(int costoEnPesos) {
        BigDecimal costo = new BigDecimal(costoEnPesos).setScale(2);
        BigDecimal iva = costo.multiply(TASA_IVA).setScale(2, RoundingMode.HALF_EVEN);
        return costo.add(iva);
    }
}
