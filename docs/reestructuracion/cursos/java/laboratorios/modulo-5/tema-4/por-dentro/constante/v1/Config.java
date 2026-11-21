// Java · M5 · Tema 4 · por dentro 2 (version 1)
// Dos campos `static final int` con la MISMA pinta. Uno es variable constante (JLS 4.12.4) y el otro no.
public class Config {

    public static final int LIMITE_CONSTANTE = 5;     // expresion constante: se ENLAZA al compilar al llamante
    public static final int LIMITE_VIVO = Calculo.cinco();

    static class Calculo {
        static int cinco() {
            return 5;
        }
    }
}
