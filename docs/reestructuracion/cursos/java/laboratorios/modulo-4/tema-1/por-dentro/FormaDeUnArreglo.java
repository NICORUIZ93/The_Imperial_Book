// M4 · Tema 1 · Por dentro · Un arreglo es un objeto de una clase que no escribes tu.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out FormaDeUnArreglo
// Y miralo en bytecode: javac -d out2 FormaDeUnArreglo.java && javap -c -cp out2 FormaDeUnArreglo
public class FormaDeUnArreglo {

    // Este metodo existe solo para verlo en bytecode: newarray / anewarray / iastore / iaload.
    static int tocaArreglos() {
        int[] numericos = new int[4];          // newarray  T_INT
        numericos[0] = 7;                      // iastore
        String[] nombres = new String[2];      // anewarray
        nombres[1] = "envio";                  // aastore
        return numericos[0] + nombres[1].length();   // iaload + aaload
    }

    public static void main(String[] args) {
        int[] pesos = {1250, 3400, 890};
        String[] zonas = {"Medellin", "Bogota"};
        int[][] matriz = new int[2][3];

        System.out.println("clase real de un int[]   : " + pesos.getClass().getName());
        System.out.println("clase real de un String[]: " + zonas.getClass().getName());
        System.out.println("clase real de un int[][] : " + matriz.getClass().getName());
        System.out.println("componente del int[]     : " + pesos.getClass().getComponentType());
        System.out.println("componente del String[]  : " + zonas.getClass().getComponentType());
        System.out.println("componente del int[][]   : " + matriz.getClass().getComponentType().getName());

        System.out.println("isArray                  : " + pesos.getClass().isArray()
                + " · superclass: " + pesos.getClass().getSuperclass()
                + " · interfaces: " + java.util.Arrays.toString(pesos.getClass().getInterfaces()));

        // Es un objeto: se le puede pasar a un parametro Object y clonar.
        Object comoObjeto = pesos;
        System.out.println("asignado a Object        : " + comoObjeto.getClass().getName()
                + " · length sigue siendo campo: " + pesos.length);

        int[] copia = (int[]) pesos.clone();
        copia[0] = 9999;
        System.out.println("clone devuelve Object    : original[0]=" + pesos[0] + " copia[0]=" + copia[0]);

        System.out.println("reflect.Array.getLength  : " + java.lang.reflect.Array.getLength(pesos)
                + " · y su elemento 1 es " + java.lang.reflect.Array.get(pesos, 1));

        System.out.println("tocaArreglos devuelve    : " + tocaArreglos());
    }
}
