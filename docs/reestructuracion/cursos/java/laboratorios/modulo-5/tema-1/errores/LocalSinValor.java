// M5 · Tema 1 · error 3: un campo sin asignar vale 0 o null; una variable local sin asignar NO existe todavia.
// Java 25. Esperado: NO compila. javac --release 25 -d out errores/LocalSinValor.java
public class LocalSinValor {
    static int campo;                 // campo de la clase: tiene valor por defecto

    public static void main(String[] args) {
        int local;                    // declarada, nunca asignada
        System.out.println("campo por defecto : " + campo);
        System.out.println("local por defecto  : " + local);   // mal: el compilador se niega
    }
}
