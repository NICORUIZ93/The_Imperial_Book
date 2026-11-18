import java.time.Clock;
import java.time.Instant;

public final class RelojesDistribuidos {
  private RelojesDistribuidos() { }

  public static void main(String[] args) throws Exception {
    Clock pared = Clock.systemUTC();
    Instant inicioPared = pared.instant();
    long inicioMonotono = System.nanoTime();
    Thread.sleep(120);
    Instant finPared = pared.instant();
    long transcurridoMs = (System.nanoTime() - inicioMonotono) / 1_000_000;
    System.out.println("pared_ordenable=" + !finPared.isBefore(inicioPared));
    System.out.println("monotono_entre_100_y_500_ms=" + (transcurridoMs >= 100 && transcurridoMs <= 500));
    System.out.println("nanoTime_no_es_fecha=true");
  }
}
