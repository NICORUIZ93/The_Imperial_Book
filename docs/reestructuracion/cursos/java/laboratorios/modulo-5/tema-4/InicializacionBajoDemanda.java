// Java · M5 · Tema 4 · ejemplo 2
// Cuándo se ejecuta `<clinit>`: la clase se inicializa SOLO al primer uso real de lo que exige
// inicializarla, una sola vez, y el padre antes que el hijo.
public class InicializacionBajoDemanda {

    static void marca(String que) {
        System.out.println("      " + que);
    }

    static class Bascula {
        static final int CONSTANTE = 7;                                   // variable constante
        static int viva = arranca("inicializador de campo (texto 1)");     // NO es constante
        static { marca("bloque static explicito (texto 2)"); }             // despues del campo

        static int arranca(String que) {
            marca("arranca(): " + que);
            return 1;
        }

        Bascula() {
            marca("<init> de Bascula");
        }
    }

    static class Padre {
        static int dePadre = 1;
        static { marca("<clinit> de Padre"); }
    }

    static class Hijo extends Padre {
        static int deHijo = 2;
        static { marca("<clinit> de Hijo"); }
    }

    interface ConConstante {
        int LIMITE = 25000;                       // constante: leerla NO inicializa nada
    }

    public static void main(String[] args) throws Exception {
        System.out.println("paso 1 · literal de clase: no debe imprimir nada");
        Class<Bascula> cual = Bascula.class;
        marca("leido Bascula.class, la clase es " + cual.getSimpleName());

        System.out.println("paso 2 · leer una constante: tampoco");
        marca("Bascula.CONSTANTE = " + Bascula.CONSTANTE);

        System.out.println("paso 3 · Class.forName con false: tampoco");
        Class.forName("InicializacionBajoDemanda$Bascula", false, Bascula.class.getClassLoader());
        marca("forName(.., false, ..) devolvio la Class sin inicializar");

        System.out.println("paso 4 · Class.forName normal: aqui SI, y en orden de texto");
        Class.forName("InicializacionBajoDemanda$Bascula");
        marca("forName(..) ya termino");

        System.out.println("paso 5 · leer el campo NO constante: ya estaba inicializada, nada nuevo");
        marca("Bascula.viva = " + Bascula.viva);

        System.out.println("paso 6 · dos objetos: <clinit> una vez, <init> dos veces");
        Bascula b1 = new Bascula();
        Bascula b2 = new Bascula();
        marca("dos basculas creadas, vivas siguen siendo " + Bascula.viva + " (" + (b1 != b2 ? "objetos distintos" : "igual") + ")");

        System.out.println("paso 7 · tocar al hijo inicializa al padre primero");
        marca("Hijo.deHijo = " + Hijo.deHijo);

        System.out.println("paso 8 · una interface con solo constantes no se inicializa al leerla");
        marca("ConConstante.LIMITE = " + ConConstante.LIMITE);

        System.out.println("paso 9 · leer lo de Padre suelto ya no repite su <clinit>");
        marca("Padre.dePadre = " + Padre.dePadre);
    }
}
