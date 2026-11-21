// M4 · Tema 6 · Error 1 · Burbuja con el limite interior mal puesto: lee un indice que no existe.
// Java 25. No esta roto a proposito: falla al ejecutarse. Comprueba:
//   javac --release 25 -d out BurbujaFueraDeRango.java && java -cp out BurbujaFueraDeRango
public class BurbujaFueraDeRango {
    public static void main(String[] args) {
        int[] pesos = {7600, 250, 1250, 890};
        for (int i = pesos.length - 1; i > 0; i--) {
            for (int j = 0; j <= i; j++) {        // mal: <= hace que v[j + 1] llegue a length
                if (pesos[j] > pesos[j + 1]) {
                    int t = pesos[j];
                    pesos[j] = pesos[j + 1];
                    pesos[j + 1] = t;
                }
            }
        }
        System.out.println("nunca se imprime");
    }
}
