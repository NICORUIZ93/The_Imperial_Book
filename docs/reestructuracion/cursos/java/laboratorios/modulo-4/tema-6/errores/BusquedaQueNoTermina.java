// M4 · Tema 6 · Error 2 · Binaria con "bajo = medio" en vez de "medio + 1": no avanza y no termina.
// Java 25. No esta roto a proposito: se detiene gracias al tope y lanza. Comprueba:
//   javac --release 25 -d out BusquedaQueNoTermina.java && java -cp out BusquedaQueNoTermina
public class BusquedaQueNoTermina {

    static int mal(int[] v, int objetivo) {
        int bajo = 0, alto = v.length - 1, vueltas = 0;
        while (bajo <= alto) {
            if (++vueltas > 1000) {
                throw new IllegalStateException("no converge: " + vueltas + " vueltas, sigue en " + bajo + ".." + alto);
            }
            int medio = bajo + (alto - bajo) / 2;
            if (v[medio] == objetivo) {
                return medio;
            } else if (v[medio] < objetivo) {
                bajo = medio;                     // mal: si medio == bajo, el rango no se achica
            } else {
                alto = medio - 1;
            }
        }
        return -1;
    }

    static int bien(int[] v, int objetivo) {
        int bajo = 0, alto = v.length - 1;
        while (bajo <= alto) {
            int medio = bajo + (alto - bajo) / 2;
            if (v[medio] == objetivo) {
                return medio;
            } else if (v[medio] < objetivo) {
                bajo = medio + 1;                 // bien: el medio ya esta descartado
            } else {
                alto = medio - 1;
            }
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] ordenado = {250, 890, 1250, 3400};
        System.out.println("bien  : 890 en el indice " + bien(ordenado, 890));
        System.out.println("mal   : 3400 (el ultimo) en el indice " + mal(ordenado, 3400));
    }
}
