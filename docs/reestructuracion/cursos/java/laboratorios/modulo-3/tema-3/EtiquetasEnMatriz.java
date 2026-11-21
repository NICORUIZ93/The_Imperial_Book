// M3 · Tema 3 · break y continue con etiqueta sobre un bucle anidado: la diferencia entre
// «salta esta vuelta» y «sal del bucle de arriba».
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out EtiquetasEnMatriz
public class EtiquetasEnMatriz {
    // Filas = vehiculos. Columnas = paradas de la ruta. Valores = gramos cargados en esa parada.
    static final int[][] CARGA = {
        {120, 340,  90},
        {210, 900, 150},   // el 900 supera el tope del vehiculo 1
        { 80,  60,  45},
        {500, 820, 300},   // y el 820 el del vehiculo 3
    };
    static final int TOPE = 800;

    // Sin etiqueta: break solo corta el bucle interior, el exterior sigue dando vueltas.
    static int sinEtiqueta() {
        int paradasVisitadas = 0;
        for (int fila = 0; fila < CARGA.length; fila++) {
            for (int col = 0; col < CARGA[fila].length; col++) {
                paradasVisitadas++;
                if (CARGA[fila][col] > TOPE) break;
            }
        }
        return paradasVisitadas;
    }

    // Con etiqueta: break RUTA sale de los dos bucles de golpe.
    static int conEtiqueta() {
        int paradasVisitadas = 0;
        RUTA:
        for (int fila = 0; fila < CARGA.length; fila++) {
            for (int col = 0; col < CARGA[fila].length; col++) {
                paradasVisitadas++;
                if (CARGA[fila][col] > TOPE) break RUTA;
            }
        }
        return paradasVisitadas;
    }

    // continue SALTO salta el resto de la FILA (no de la parada) y arranca la siguiente.
    static int saltandoFilas() {
        int suma = 0;
        SALTO:
        for (int fila = 0; fila < CARGA.length; fila++) {
            for (int col = 0; col < CARGA[fila].length; col++) {
                if (CARGA[fila][col] > TOPE) continue SALTO;
                suma += CARGA[fila][col];
            }
        }
        return suma;
    }

    // continue sin etiqueta, en el mismo sitio: salta la PARADA y sigue en la misma fila.
    static int saltandoParadas() {
        int suma = 0;
        for (int fila = 0; fila < CARGA.length; fila++) {
            for (int col = 0; col < CARGA[fila].length; col++) {
                if (CARGA[fila][col] > TOPE) continue;
                suma += CARGA[fila][col];
            }
        }
        return suma;
    }

    public static void main(String[] args) {
        System.out.println("paradas visitadas sin etiqueta : " + sinEtiqueta());
        System.out.println("paradas visitadas con break    : " + conEtiqueta());
        System.out.println("suma con continue SALTO (filas): " + saltandoFilas());
        System.out.println("suma con continue solo (paradas): " + saltandoParadas());
    }
}
