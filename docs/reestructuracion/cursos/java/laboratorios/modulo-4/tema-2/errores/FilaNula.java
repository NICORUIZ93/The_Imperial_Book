// M4 · Tema 2 · Error 2 · new int[3][] deja las FILAS en null: nadie ha creado todavia las columnas.
// Java 25. No esta roto a proposito: falla al ejecutarse. Comprueba:
//   javac --release 25 -d out FilaNula.java && java -cp out FilaNula
public class FilaNula {
    public static void main(String[] args) {
        int[][] porFila = new int[3][];
        System.out.println("fila 0: " + porFila[0]);
        porFila[0] = new int[] {1250, 3400};
        System.out.println("recorro las tres filas:");
        for (int i = 0; i < porFila.length; i++) {
            System.out.println("  fila " + i + " tiene " + porFila[i].length + " columnas");
        }
    }
}
