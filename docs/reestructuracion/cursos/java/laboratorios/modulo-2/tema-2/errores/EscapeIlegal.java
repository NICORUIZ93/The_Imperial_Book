// tema-2/errores/EscapeIlegal.java — una barra dentro de un texto ordinario es el principio de una secuencia.
// Es el error clásico al escribir rutas: \d y \n no son lo que parece.
// Ejecutar (no compila a propósito): javac --release 25 -encoding UTF-8 -d out tema-2/errores/EscapeIlegal.java
public class EscapeIlegal {

    public static void main(String[] args) {
        String ruta = "C:\datos\new\guías.txt";
        System.out.println(ruta);
    }
}
