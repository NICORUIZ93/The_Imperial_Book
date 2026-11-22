public class ScopeDemo {
  static final double IVA = 0.19;
  public static void main(String[] args) {
    double subtotal = 100;
    double total = subtotal * (1 + IVA);
    if (total > 100) {
      String etiqueta = "caro";
      System.out.println(etiqueta);
    }
    System.out.println(total);
  }
}
