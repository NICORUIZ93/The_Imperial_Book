// M4 · Tema 3 · Error 2 · Un arreglo de primitivos NO es un arreglo de Object: ahi se acaba la covarianza.
// Java 25. No esta roto a proposito: no compila. Comprueba:
//   javac --release 25 -d out PrimitivosNoSonObjectArray.java
public class PrimitivosNoSonObjectArray {
    public static void main(String[] args) {
        int[] pesos = {1250, 3400, 890};
        Object[] comoObjetos = pesos;         // mal: int[] no es subtipo de Object[]
        // bien: Object unObjeto = pesos;     (el arreglo como objeto SI vale)
        System.out.println(comoObjetos.length);
    }
}
