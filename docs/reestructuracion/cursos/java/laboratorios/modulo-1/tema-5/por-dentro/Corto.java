// M1 · Tema 5 · nivel maestro: el cortocircuito es un salto; i = i++ pierde el incremento; += trae su casting.
// Mira: javac -d out Corto.java && javap -c -cp out Corto
public class Corto {
    static boolean despachable(String destino, int peso) {
        return destino != null && peso <= 30000;
    }

    static int trampa(int i) {
        i = i++;
        return i;
    }

    static byte compuesta(byte cajas) {
        cajas += 5;
        return cajas;
    }
}
