public final class ClasificarArquitectura {
  record Evidencia(int artefactos, int procesos, int modulos, boolean datosCompartidos,
                   boolean despliegueIndependiente) { }
  private ClasificarArquitectura() { }
  static String clasificar(Evidencia e) {
    if (e.artefactos() == 1 && e.procesos() == 1 && e.modulos() > 1) return "MONOLITO_MODULAR";
    if (e.procesos() > 1 && (e.datosCompartidos() || !e.despliegueIndependiente()))
      return "MONOLITO_DISTRIBUIDO";
    if (e.procesos() > 1 && e.despliegueIndependiente()) return "SERVICIOS_AUTONOMOS";
    return "MONOLITO";
  }
  public static void main(String[] args) {
    System.out.println(clasificar(new Evidencia(1, 1, 2, true, false)));
    System.out.println(clasificar(new Evidencia(2, 2, 2, true, false)));
    System.out.println(clasificar(new Evidencia(2, 2, 2, false, true)));
  }
}
