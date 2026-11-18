import java.util.*;
public final class RomperCiclo {
  record EnvioConfirmado(String envioId) { }
  interface Publicar { void evento(EnvioConfirmado evento); }
  static final class Memoria implements Publicar {
    final List<EnvioConfirmado> eventos=new ArrayList<>();
    public void evento(EnvioConfirmado e){eventos.add(e);}
  }
  public static void main(String[] args){var bus=new Memoria();bus.evento(new EnvioConfirmado("env-7"));System.out.println("eventos="+bus.eventos.size());}
}
