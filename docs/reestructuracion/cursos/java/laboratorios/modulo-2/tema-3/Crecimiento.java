// tema-3/Crecimiento.java — cuántos caracteres se copian de verdad en cada forma de construir el mismo texto.
// Ejecutar: javac --release 25 -d out tema-3/Crecimiento.java && java -Dstdout.encoding=UTF-8 -cp out Crecimiento
public class Crecimiento {

    static final String PIEZA = "RF-0"; // 4 caracteres por pieza

    public static void main(String[] args) {
        int n = 1000;

        // 1. Lo que cuesta «s += pieza»: en cada vuelta se crea un texto nuevo con TODO lo anterior copiado.
        long copiasMas = 0;
        for (int k = 1; k <= n; k++) {
            copiasMas += (long) k * PIEZA.length();
        }

        // 2. Lo que cuesta un StringBuilder que empieza vacío: solo copia cuando la capacidad se queda corta.
        StringBuilder b = new StringBuilder();
        System.out.println("capacidad inicial   : " + b.capacity());
        StringBuilder crecimientos = new StringBuilder();
        long copiasBuilder = 0;
        int vecesQueCrece = 0;
        for (int i = 0; i < n; i++) {
            int capacidadAntes = b.capacity();
            int longitudAntes = b.length();
            b.append(PIEZA);
            if (b.capacity() != capacidadAntes) {
                vecesQueCrece++;
                copiasBuilder += longitudAntes + PIEZA.length();
                if (vecesQueCrece <= 8) {
                    crecimientos.append(capacidadAntes).append("→").append(b.capacity()).append("  ");
                }
            }
        }
        System.out.println("crecimientos reales : " + vecesQueCrece + " · " + crecimientos.toString().strip() + "…");

        // 3. Lo que cuesta un StringBuilder con la capacidad justa.
        StringBuilder c = new StringBuilder(n * PIEZA.length());
        int creceConCapacidad = 0;
        for (int i = 0; i < n; i++) {
            int antes = c.capacity();
            c.append(PIEZA);
            if (c.capacity() != antes) {
                creceConCapacidad++;
            }
        }
        System.out.println("capacidad exacta    : crece " + creceConCapacidad + " veces");

        // 4. Verificación de que los tres caminos dan el mismo texto.
        String conMas = "";
        for (int i = 0; i < n; i++) {
            conMas += PIEZA;
        }
        System.out.println("longitudes          : += " + conMas.length()
                + " · builder " + b.length() + " · con capacidad " + c.length());
        System.out.println("mismo texto         : " + (conMas.contentEquals(b) && conMas.contentEquals(c)));

        // 5. La cuenta.
        System.out.println("caracteres copiados : += " + copiasMas
                + " · builder sin capacidad " + copiasBuilder
                + " · builder con capacidad 0");
        System.out.println("factor              : += es " + (copiasMas / Math.max(1, copiasBuilder))
                + " veces el builder sin capacidad");
    }
}
