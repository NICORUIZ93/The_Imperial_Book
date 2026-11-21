// M4 · Tema 1 · Error 2 · Un indice negativo es tan ilegal como uno mayor o igual que length.
// Java 25. No esta roto a proposito: falla al ejecutarse. Comprueba:
//   javac --release 25 -d out IndiceNegativo.java && java -cp out IndiceNegativo
public class IndiceNegativo {
    public static void main(String[] args) {
        int[] pesos = {1250, 3400, 890};
        for (int i = pesos.length - 1; i >= 0; i--) {   // bien: 2, 1, 0. nunca -1
            System.out.println("indice " + i + " = " + pesos[i]);
        }
        // aqui el -1 no lo produce el bucle: lo produce una resta de nadie.
        int anterior = 0 - 1;
        System.out.println("ahora leemos pesos[" + anterior + "]");
        System.out.println("valor: " + pesos[anterior]);
    }
}
