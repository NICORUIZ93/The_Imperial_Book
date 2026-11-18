public final class CalcularTarifaPura {
  public long enCentavos(int kilometros, int kilos) {
    if (kilometros < 0 || kilos <= 0) throw new IllegalArgumentException("distancia/peso inválidos");
    return 1_000L + kilometros * 80L + kilos * 120L;
  }
  public static void main(String[] args) {
    var calculadora = new CalcularTarifaPura();
    System.out.println(calculadora.enCentavos(10, 2));
    try { calculadora.enCentavos(10, 0); }
    catch (IllegalArgumentException error) { System.out.println(error.getMessage()); }
  }
}
