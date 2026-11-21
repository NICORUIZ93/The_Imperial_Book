// M4 · Tema 1 · Error 3 · length es un campo del arreglo; length() es un método de String.
// Java 25. No esta roto a proposito: no compila. Comprueba:
//   javac --release 25 -d out ConfundeParentesisConLength.java
public class ConfundeParentesisConLength {
    public static void main(String[] args) {
        int[] llegada = {1250, 3400, 890};
        String zona = "Medellin";
        System.out.println("zona: " + zona.length());       // bien: String si tiene metodo
        System.out.println("arreglo: " + llegada.length()); // mal: el arreglo tiene campo, no metodo
    }
}
