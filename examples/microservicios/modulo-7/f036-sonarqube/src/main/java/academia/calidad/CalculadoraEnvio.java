package academia.calidad;

/**
 * Regla de negocio pequeña para que SonarQube mida cobertura y busque problemas.
 * Costo: 5 + 2 por kg; express duplica; desde 20 kg el envío normal es gratis.
 */
public final class CalculadoraEnvio {

    private CalculadoraEnvio() {
    }

    public static int costo(int pesoKg, boolean express) {
        if (pesoKg <= 0) {
            throw new IllegalArgumentException("El peso debe ser positivo");
        }
        if (!express && pesoKg >= 20) {
            return 0;
        }
        int base = 5 + 2 * pesoKg;
        return express ? base * 2 : base;
    }
}
