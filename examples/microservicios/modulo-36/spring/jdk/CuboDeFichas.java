// Módulo 32 · F183 · Cubo de fichas (token bucket) en Java puro (JDK 25), con reloj simulado: la misma cuenta que hace
// el RedisRateLimiter de Spring Cloud Gateway con replenishRate y burstCapacity. Ejecuta: java spring/jdk/CuboDeFichas.java
public class CuboDeFichas {
    private final double tasa;
    private final double capacidad;
    private double fichas;
    private long ultimoMs;

    CuboDeFichas(double tasa, double capacidad) {
        this.tasa = tasa;
        this.capacidad = capacidad;
        this.fichas = capacidad;
    }

    boolean permitir(long ahoraMs) {
        fichas = Math.min(capacidad, fichas + (ahoraMs - ultimoMs) / 1000.0 * tasa);
        ultimoMs = ahoraMs;
        if (fichas >= 1) { fichas -= 1; return true; }
        return false;
    }

    public static void main(String[] args) {
        CuboDeFichas cubo = new CuboDeFichas(2, 10); // replenishRate 2, burstCapacity 10
        int aceptadas = 0;
        for (int i = 0; i < 11; i++) if (cubo.permitir(0)) aceptadas++;
        System.out.println("ráfaga en t=0 s: " + aceptadas + " de 11 aceptadas");
        System.out.println("t=1 s: " + cubo.permitir(1000) + ", " + cubo.permitir(1000) + ", " + cubo.permitir(1000));
    }
}
