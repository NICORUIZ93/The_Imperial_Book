// M5 · Tema 1 · error 1: `this` ES el objeto receptor, y en un metodo static no hay receptor.
// Java 25. Esperado: NO compila. javac --release 25 -d out errores/ThisDesdeStatic.java
public class ThisDesdeStatic {
    int gramos;

    public static void main(String[] args) {
        System.out.println(this.gramos);          // mal: main no recibe un objeto
    }
}
