// M4 · Tema 3 · Error 1 · El cast de un arreglo NO lo hace el compilador: lo hace la JVM y puede mentirte.
// Java 25. No esta roto a proposito: compila y falla al ejecutarse. Comprueba:
//   javac --release 25 -d out CastInvalido.java && java -cp out CastInvalido
public class CastInvalido {
    public static void main(String[] args) {
        Object[] cajas = new Object[2];
        String[] guias = (String[]) cajas;        // compila: la relacion inversa tambien "parece" legal
        System.out.println("esto no se imprime: " + guias.length);
    }
}
