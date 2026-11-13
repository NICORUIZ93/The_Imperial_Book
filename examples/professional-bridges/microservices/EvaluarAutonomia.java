public final class EvaluarAutonomia {
  record Senales(boolean contratoCompatible, boolean datosPropios, boolean despliegueIndependiente,
                 boolean operacionPropia, boolean beneficioMedido) { }
  private EvaluarAutonomia() { }
  static String decidir(Senales s) {
    int autonomy = (s.contratoCompatible() ? 1 : 0) + (s.datosPropios() ? 1 : 0)
        + (s.despliegueIndependiente() ? 1 : 0) + (s.operacionPropia() ? 1 : 0);
    return autonomy == 4 && s.beneficioMedido() ? "CANDIDATO_A_EXTRAER" : "MANTENER_MODULAR";
  }
  public static void main(String[] args) {
    System.out.println(decidir(new Senales(true, false, false, false, false)));
    System.out.println(decidir(new Senales(true, true, true, true, true)));
  }
}
