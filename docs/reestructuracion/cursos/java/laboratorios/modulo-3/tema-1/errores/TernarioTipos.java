// M3 · Tema 1 · error: las dos ramas de un ternario no tienen un tipo comun para el destino.
// Java 25. Ejecuta (debe fallar al compilar): javac --release 25 TernarioTipos.java
// Medido aqui: con «Object texto = ...» la MISMA expresion si compila (eso es lo que hace
// DecidirPrecedencia). Pero con el destino declarado String, javac no acepta el Integer:
// «bad type in conditional expression ... Integer cannot be converted to String».
public class TernarioTipos {
    public static void main(String[] args) {
        boolean urgente = true;
        String texto = urgente ? "Bogotá" : Integer.valueOf(2500);
        System.out.println(texto);
    }
}
