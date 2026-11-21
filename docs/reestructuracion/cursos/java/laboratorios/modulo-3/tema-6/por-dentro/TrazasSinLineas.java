// M3 · Tema 6 · por dentro: que dice la traza cuando el .class se compilo sin informacion de depuracion.
// Java 25. Ejecuta (con lineas):  javac --release 25 -d out TrazasSinLineas.java
//                                java -cp out TrazasSinLineas
//                 (sin lineas):   javac --release 25 -g:none -d sinnombre TrazasSinLineas.java
//                                java -cp sinnombre TrazasSinLineas
// Medido aqui: con -g la traza dice «TrazasSinLineas.reparte(TrazasSinLineas.java:11)»; con -g:none
// dice «TrazasSinLineas.reparte(Unknown Source)», porque el .class se queda sin SourceFile, sin
// LineNumberTable y sin LocalVariableTable (javap -v no muestra ninguno de los tres atributos). No es
// que falle otro sitio: es que ya no se puede decir donde.
public class TrazasSinLineas {
    static int reparte(String peso) { return Integer.parseInt(peso) / 1000; }

    public static void main(String[] args) {
        System.out.println("tanda: " + reparte("sin peso"));
    }
}
