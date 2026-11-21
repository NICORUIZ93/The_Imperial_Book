// M5 · Tema 1 · error 2: un metodo de instancia necesita UN objeto; llamarlo por el nombre de la clase no lo hay.
// Java 25. Esperado: NO compila. javac --release 25 -d out errores/MetodoSinObjeto.java
public class MetodoSinObjeto {

    static class Guia {
        String codigo = "RF-000123";

        String etiqueta() {
            return codigo;
        }
    }

    public static void main(String[] args) {
        System.out.println(Guia.etiqueta());      // mal: no hay receptor, la clase no tiene campos
    }
}
