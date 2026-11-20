// M1 · Tema 5 · ejemplo mínimo: precedencia, orden de evaluación, cortocircuito y asignación compuesta.
// Java 25. Ejecuta: java -Dstdout.encoding=UTF-8 Operadores.java
public class Operadores {
    // Imprime su nombre al evaluarse: así se ve el orden real.
    static int ver(String nombre, int valor) {
        System.out.print(nombre + " ");
        return valor;
    }

    static boolean comprobar(String nombre, boolean valor) {
        System.out.print(nombre + " ");
        return valor;
    }

    public static void main(String[] args) {
        System.out.println("2 + 3 * 4 = " + (2 + 3 * 4) + " · (2 + 3) * 4 = " + (2 + 3) * 4);
        System.out.println("7 / 2 = " + 7 / 2 + " · 7 % 2 = " + 7 % 2 + " · -7 / 2 = " + -7 / 2 + " · -7 % 2 = " + -7 % 2);

        // La precedencia decide cómo se AGRUPA; el orden de evaluación es siempre de izquierda a derecha.
        System.out.print("orden: ");
        int r = ver("a", 1) + ver("b", 2) * ver("c", 3);
        System.out.println("→ " + r);

        int i = 5;
        int despues = i++;     // usa 5 y luego sube a 6
        int antes = ++i;       // sube a 7 y usa 7
        System.out.println("i++ dio " + despues + " · ++i dio " + antes + " · i = " + i);
        i = i++;               // trampa clásica: i se queda igual
        System.out.println("tras i = i++: " + i);

        // Cortocircuito: && y || no evalúan la derecha si la izquierda ya decide.
        System.out.print("&&: ");
        boolean y = comprobar("izq", false) && comprobar("der", true);
        System.out.println("→ " + y);
        System.out.print("&:  ");
        boolean ySinCorto = comprobar("izq", false) & comprobar("der", true);
        System.out.println("→ " + ySinCorto);

        // Asignación compuesta: lleva un casting escondido.
        byte cajas = 10;
        cajas += 5;            // equivale a cajas = (byte) (cajas + 5)
        int pesos = 100;
        pesos += 3.7;          // compila: (int) (100 + 3.7)
        byte desbordado = 120;
        desbordado += 10;      // (byte) 130
        System.out.println("cajas = " + cajas + " · pesos = " + pesos + " · desbordado = " + desbordado);

        System.out.println("1 + 2 + \"3\" = " + (1 + 2 + "3") + " · \"1\" + 2 + 3 = " + ("1" + 2 + 3));
    }
}
