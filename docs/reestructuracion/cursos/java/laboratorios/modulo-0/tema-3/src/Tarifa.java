// M0 · Tema 3 · la regla de tarifa: base fija más un valor por cada kilogramo empezado.
public class Tarifa {
    static final int BASE_EN_PESOS = 6000;
    static final int PESOS_POR_KILO = 1800;

    static int costoEnPesos(int pesoGramos) {
        int kilosEmpezados = (pesoGramos + 999) / 1000;
        return BASE_EN_PESOS + kilosEmpezados * PESOS_POR_KILO;
    }
}
