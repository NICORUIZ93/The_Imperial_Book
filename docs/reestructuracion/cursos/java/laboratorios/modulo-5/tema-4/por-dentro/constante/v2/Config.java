// Java · M5 · Tema 4 · por dentro 2 (version 2: CAMBIADA sin recompilar al Lector)
// Mismo nombre de clase, mismos dos campos, valores nuevos.
public class Config {

    public static final int LIMITE_CONSTANTE = 99;    // se cambia el valor...
    public static final int LIMITE_VIVO = Calculo.noventaYNueve();

    static class Calculo {
        static int noventaYNueve() {                  // ...y tambien la forma de calcularlo
            return 99;
        }
    }
}
