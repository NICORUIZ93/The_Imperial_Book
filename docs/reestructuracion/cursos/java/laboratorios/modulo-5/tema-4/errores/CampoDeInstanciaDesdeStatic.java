// Java · M5 · Tema 4 · error 2
// Dentro de un metodo `static` no hay `this`, luego no hay objeto del que leer un campo de instancia.
public class CampoDeInstanciaDesdeStatic {

    String codigo = "RF-000123";

    static String etiqueta() {
        return codigo;              // error: non-static variable codigo cannot be referenced from a static context
    }

    public static void main(String[] args) {
        System.out.println(etiqueta());
    }
}
