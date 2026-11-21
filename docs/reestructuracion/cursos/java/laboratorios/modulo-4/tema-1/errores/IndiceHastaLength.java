// M4 · Tema 1 · Error 1 · El ultimo indice es length - 1, y usar <= lo salta.
// Java 25. No esta roto a proposito: falla al ejecutarse. Comprueba:
//   javac --release 25 -d out IndiceHastaLength.java && java -cp out IndiceHastaLength
public class IndiceHastaLength {
    public static void main(String[] args) {
        int[] llegada = {1250, 3400, 890, 7600, 250};
        long suma = 0;
        for (int i = 0; i <= llegada.length; i++) {   // <= en vez de <
            suma += llegada[i];
        }
        System.out.println("suma: " + suma);
    }
}
