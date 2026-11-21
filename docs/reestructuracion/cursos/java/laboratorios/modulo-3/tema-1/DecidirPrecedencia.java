// M3 · Tema 1 · ejemplo minimo: las dos formas de una condicion y que el tipo del ternario no es obvio.
// Java 25. Ejecuta: java -Dstdout.encoding=UTF-8 DecidirPrecedencia.java
public class DecidirPrecedencia {
    public static void main(String[] args) {
        int pesoGramos = 1001;
        boolean urgente = true;

        // Forma 1: if/else. Se lee como pasos.
        String etiqueta;
        if (urgente) {
            etiqueta = "prioritario";
        } else {
            etiqueta = "regular";
        }

        // Forma 2: el mismo decision en una expresion.
        String etiquetaCorta = urgente ? "prioritario" : "regular";

        System.out.println("decisión: " + etiqueta + " · " + etiquetaCorta);

        // El tipo del resultado NO es el de una rama: se promociona.
        double base = urgente ? 1 : 2.5;
        System.out.println("rama entera contra rama decimal: " + base + " (" + ((Object) base).getClass().getSimpleName() + ")");

        // Y con dos tipos referencia distintos, el compilador busca un supremo comun:
        // esto NO compila (mira el error): String texto = urgente ? "Bogotá" : Integer.valueOf(2500);
        Object texto = urgente ? "Bogotá" : Integer.valueOf(2500);
        System.out.println("valor guardado en Object: " + texto.getClass().getName());

        // Tres niveles de ternario anidado: nadie los lee. Se escriben como if/else-if.
        String zona;
        if (pesoGramos > 5000) {
            zona = "carga";
        } else if (pesoGramos > 1000) {
            zona = "mediano";
        } else {
            zona = "liviano";
        }
        System.out.println("peso " + pesoGramos + " g -> " + zona);
    }
}
