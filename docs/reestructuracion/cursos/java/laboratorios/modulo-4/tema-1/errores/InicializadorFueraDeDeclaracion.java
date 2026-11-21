// M4 · Tema 1 · Error 4 · Las llaves solo valen en la declaracion, no en una asignacion suelta.
// Java 25. No esta roto a proposito: no compila. Comprueba:
//   javac --release 25 -d out InicializadorFueraDeDeclaracion.java
public class InicializadorFueraDeDeclaracion {
    public static void main(String[] args) {
        int[] llegada = new int[5];
        llegada = {1250, 3400, 890};   // mal: las llaves sin "new" solo van en la declaracion
        // bien: llegada = new int[]{1250, 3400, 890};  (aqui el "new" es obligatorio)
        System.out.println(llegada.length);
    }
}
