// M3 · Tema 3 · el clasico «me paso de la ultima casilla»: el arreglo tiene N casillas, 0..N-1.
// Java 25. Ejecuta: javac --release 25 -d out IndiceFuera.java && java -cp out IndiceFuera
public class IndiceFuera {
    static final int[] PESOS = {1250, 3400, 890};

    public static void main(String[] args) {
        // length es la cantidad de casillas, NO el ultimo indice valido.
        for (int i = 0; i <= PESOS.length; i++) {
            System.out.println("casilla " + i + " = " + PESOS[i]);
        }
    }
}
