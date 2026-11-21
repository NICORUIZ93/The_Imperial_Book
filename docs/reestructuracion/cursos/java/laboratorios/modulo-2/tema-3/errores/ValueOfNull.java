// tema-3/errores/ValueOfNull.java — por qué Precedencia.java escribe String.valueOf((Object) null).
// Sin el cast, «null» no es ambiguo para javac: gana la sobrecarga valueOf(char[]) y falla en tiempo de ejecución.
// Ejecutar: javac --release 25 -d out tema-3/errores/ValueOfNull.java
//           java -cp out ValueOfNull
public class ValueOfNull {

    public static void main(String[] args) {
        System.out.println("con cast a Object   : " + String.valueOf((Object) null));
        System.out.println("concatenando null   : " + (null + "RF"));
        // La línea siguiente compila, pero lanza NullPointerException al ejecutarse.
        System.out.println("sin cast            : " + String.valueOf(null));
    }
}
