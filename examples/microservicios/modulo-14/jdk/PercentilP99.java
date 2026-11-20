// F074 · Alerting basado en p99 — por qué el promedio engaña y cómo decide Prometheus, solo JDK 25.
// 1) 10 000 latencias simuladas: promedio, p50, p95, p99 exactos.
// 2) Las mismas en un histograma con buckets y el p99 estimado como histogram_quantile (interpolación lineal).
// 3) Dos instancias: promediar sus p99 frente a sumar sus histogramas.
// 4) La máquina de estados de una regla de alerta con "for: 2m" evaluada cada minuto.
// Ejecuta:  java PercentilP99.java
import java.util.Arrays;
import java.util.Random;

public class PercentilP99 {

    static final double[] LE = {0.05, 0.1, 0.25, 0.5, 1.0, 2.5, Double.POSITIVE_INFINITY};

    // 98 % rápidas (~80 ms) y 2 % lentas (1,2–2 s): una cola larga, como una dependencia que a veces tarda.
    static double[] latencias(long semilla, int n, double fraccionLenta) {
        Random r = new Random(semilla);
        double[] v = new double[n];
        for (int i = 0; i < n; i++) {
            v[i] = r.nextDouble() < fraccionLenta ? 1.2 + r.nextDouble() * 0.8 : Math.max(0.005, 0.08 + r.nextGaussian() * 0.02);
        }
        return v;
    }

    // Percentil exacto por rango más cercano.
    static double percentil(double[] v, double q) {
        double[] o = v.clone();
        Arrays.sort(o);
        return o[(int) Math.ceil(q * o.length) - 1];
    }

    static long[] histograma(double[] v) {
        long[] acumulado = new long[LE.length];
        for (double x : v) for (int i = 0; i < LE.length; i++) if (x <= LE[i]) acumulado[i]++;
        return acumulado;
    }

    // Igual que histogram_quantile de Prometheus: busca el bucket del rango q·total e interpola dentro de él.
    static double histogramQuantile(double q, long[] acumulado) {
        double rango = q * acumulado[acumulado.length - 1];
        for (int i = 0; i < LE.length; i++) {
            if (acumulado[i] >= rango) {
                if (Double.isInfinite(LE[i])) return LE[i - 1];               // cae en +Inf: devuelve el último límite finito
                double inferior = i == 0 ? 0 : LE[i - 1];
                long antes = i == 0 ? 0 : acumulado[i - 1];
                return inferior + (LE[i] - inferior) * (rango - antes) / (acumulado[i] - antes);
            }
        }
        return Double.NaN;
    }

    static String ms(double s) { return String.format("%6.0f ms", s * 1000); }

    public static void main(String[] args) {
        int fallos = 0;
        double[] a = latencias(42, 10_000, 0.02);
        double promedio = Arrays.stream(a).average().orElseThrow();
        System.out.println("10 000 peticiones de la instancia A (2 % lentas):");
        System.out.println("  promedio " + ms(promedio) + " · p50 " + ms(percentil(a, 0.50)) + " · p95 " + ms(percentil(a, 0.95))
                + " · p99 " + ms(percentil(a, 0.99)));
        long[] h = histograma(a);
        System.out.println("  histograma acumulado (le): " + Arrays.toString(h));
        double p99h = histogramQuantile(0.99, h);
        System.out.println("  histogram_quantile(0.99) " + ms(p99h) + "  (estimado desde los buckets 1.0 y 2.5)");
        if (promedio > 0.5 || percentil(a, 0.99) < 1.0 || p99h < 1.0 || p99h > 2.5) fallos++;

        double[] b = latencias(7, 10_000, 0.0);                             // instancia B: sin cola lenta
        double[] todas = new double[a.length + b.length];
        System.arraycopy(a, 0, todas, 0, a.length);
        System.arraycopy(b, 0, todas, a.length, b.length);
        long[] hb = histograma(b), suma = new long[LE.length];
        for (int i = 0; i < LE.length; i++) suma[i] = h[i] + hb[i];
        double promedioDeP99 = (percentil(a, 0.99) + percentil(b, 0.99)) / 2;
        System.out.println("Dos instancias (A con cola lenta, B sin ella):");
        System.out.println("  promedio de los p99 de cada una           " + ms(promedioDeP99) + "   <- no es el p99 de nadie");
        System.out.println("  p99 real de todas las peticiones          " + ms(percentil(todas, 0.99)));
        System.out.println("  histogram_quantile(0.99, suma de buckets) " + ms(histogramQuantile(0.99, suma)) + "   <- error por buckets anchos (0.1–0.25)");

        // Regla: p99 > 500 ms durante 2 minutos (for: 2m), evaluada cada minuto.
        double[] p99PorMinuto = {0.21, 0.24, 0.62, 0.71, 0.66, 0.30, 0.58, 0.22};
        String estado = "inactive";
        int activaDesde = -1;
        System.out.println("Regla PedidosLatenciaP99Alta: p99 > 0.5 s con for: 2m");
        StringBuilder estados = new StringBuilder();
        for (int min = 0; min < p99PorMinuto.length; min++) {
            boolean condicion = p99PorMinuto[min] > 0.5;
            if (!condicion) { estado = activaDesde >= 0 && estado.equals("firing") ? "resuelta" : "inactive"; activaDesde = -1; }
            else {
                if (activaDesde < 0) activaDesde = min;
                estado = min - activaDesde >= 2 ? "firing" : "pending";
            }
            System.out.printf("  minuto %d  p99=%.2f s  -> %s%n", min, p99PorMinuto[min], estado);
            estados.append(estado.charAt(0));
        }
        if (!estados.toString().equals("iippfrpi")) fallos++;          // inactive, pending, firing, resuelta
        System.out.println(fallos == 0 ? "OK: el promedio oculta la cola; la alerta solo dispara tras 2 min sostenidos" : "FALLA: " + fallos);
        System.exit(fallos == 0 ? 0 : 1);
    }
}
