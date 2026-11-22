/**
 * Calculadora simple de impuestos.
 * Convenciones: clase PascalCase, métodos camelCase, constantes UPPER_SNAKE_CASE.
 */
public class CalculadoraImpuestos {
  public static final double TASA_IVA = 0.19;

  public double calcularTotal(double subtotal) {
    // Valida entrada antes de calcular.
    if (subtotal < 0) {
      throw new IllegalArgumentException("subtotal negativo");
    }
    return subtotal * (1 + TASA_IVA);
  }

  public static void main(String[] args) {
    CalculadoraImpuestos calc = new CalculadoraImpuestos();
    System.out.println(calc.calcularTotal(100));
  }
}
