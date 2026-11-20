// M1 · Tema 5 · ejemplo realista: las condiciones de despacho de un paquete y sus marcas guardadas en bits.
// Java 25. Ejecuta: java -Dstdout.encoding=UTF-8 ReglasDeDespacho.java
public class ReglasDeDespacho {
    // Cada marca ocupa un bit distinto: caben 32 en un int.
    static final int FRAGIL = 1 << 0;        // 001
    static final int REFRIGERADO = 1 << 1;   // 010
    static final int URGENTE = 1 << 2;       // 100

    static String binario(int marcas) {
        return String.format("%3s", Integer.toBinaryString(marcas)).replace(' ', '0');
    }

    public static void main(String[] args) {
        int marcas = FRAGIL | URGENTE;                 // encender dos bits
        System.out.println("marcas          = " + binario(marcas));
        System.out.println("¿frágil?        " + ((marcas & FRAGIL) != 0));
        System.out.println("¿refrigerado?   " + ((marcas & REFRIGERADO) != 0));
        marcas |= REFRIGERADO;                         // encender
        marcas &= ~URGENTE;                            // apagar
        marcas ^= FRAGIL;                              // alternar
        System.out.println("tras cambios    = " + binario(marcas));

        // Desplazamientos: >> conserva el signo, >>> rellena con ceros.
        System.out.println("-16 >> 2 = " + (-16 >> 2) + " · -16 >>> 28 = " + (-16 >>> 28) + " · 1 << 33 = " + (1 << 33));

        // Cortocircuito como protección: la derecha solo se evalúa si destino no es null.
        String destino = null;
        int pesoGramos = 31_000;
        boolean despachable = destino != null && !destino.isBlank() && pesoGramos <= 30_000;
        System.out.println("¿despachable?   " + despachable);

        // Precedencia: && agrupa antes que ||. Los paréntesis cambian la regla de negocio.
        boolean pagado = true, esCliente = true, tieneCredito = true;
        System.out.println("sin paréntesis: " + (pagado || esCliente && tieneCredito && pesoGramos <= 30_000));
        System.out.println("con paréntesis: " + ((pagado || esCliente) && tieneCredito && pesoGramos <= 30_000));

        String motivo = destino == null ? "falta destino" : pesoGramos > 30_000 ? "excede el tope" : "ninguno";
        System.out.println("motivo:         " + motivo);

        // Sin cortocircuito, la misma condición revienta.
        boolean roto = destino != null & !destino.isBlank();
        System.out.println(roto);
    }
}
