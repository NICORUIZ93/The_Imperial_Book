// Java · M5 · Tema 4 · error 1 (que ya NO es error en Java 25)
// Hasta Java 15 una clase interna que no era `static` no podia declarar miembros `static`. JEP 395 (Java 16)
// lo quito: con `--release 25` este fuente COMPILA, y el mensaje solo sale compilando con `--release 8` o `15`.
public class StaticEnClaseInterna {

    String etiqueta = "RF-000123";

    class Interna {                     // interior de instancia: hay un objeto exterior detras
        static int compartida = 1;      // error
        static int estable() {          // error
            return 2;
        }
    }

    public static void main(String[] args) {
        System.out.println(new StaticEnClaseInterna().new Interna().getClass().getSimpleName());
    }
}
