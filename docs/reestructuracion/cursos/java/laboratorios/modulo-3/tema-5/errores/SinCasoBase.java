// M3 · Tema 5 · una recursividad sin caso base real: la traza lo grita, y no dice el por que.
// Java 25. Ejecuta: javac --release 25 -d out SinCasoBase.java && java -Xss256k -cp out SinCasoBase
// Fijate en la traza: la MISMA linea se repite. Eso es la firma de una recursion que no para.
// El StackOverflowError no trae mensaje: no te dice que fallo, solo que la pila se acabo.
public class SinCasoBase {
    static int siguientesEnLaRuta(int parada) {
        if (parada == 0) return 0;              // el caso base mira el 0...
        return 1 + siguientesEnLaRuta(parada + 1); // ...pero el recursion se aleja de el
    }

    public static void main(String[] args) {
        System.out.println(siguientesEnLaRuta(3));
    }
}
