public final class EvaluarExtraccion {
  record Evidencia(int desplieguesMes,int cpuPorcentaje,boolean datosPropios,boolean onCallPropio) {}
  static String decidir(Evidencia e){return e.desplieguesMes()>8&&e.cpuPorcentaje()>60&&e.datosPropios()&&e.onCallPropio()?"REVISAR_EXTRACCION":"MANTENER_MODULAR";}
  public static void main(String[] args){System.out.println(decidir(new Evidencia(2,20,false,false)));System.out.println(decidir(new Evidencia(12,70,true,true)));}
}
