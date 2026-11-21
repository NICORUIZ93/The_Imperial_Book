// M4 · Tema 5 · Error 4 · El ternario entre un int y una caja se TIPIFICA como int: desempaca la caja.
// Java 25. No esta roto a proposito: la segunda llamada falla al ejecutarse. Comprueba:
//   javac --release 25 -d out TernarioDesempacota.java && java -cp out TernarioDesempacota
public class TernarioDesempacota {

    static int decide(boolean hayGuia) {
        Integer caja = hayGuia ? 1250 : null;     // esto es una condicional de REFERENCIA: null entra bien
        int peso = hayGuia ? 1250 : caja;         // y esto es una condicional NUMERICA: caja se desempaca
        return peso;
    }

    public static void main(String[] args) {
        System.out.println("con guia    : " + decide(true));
        System.out.println("sin guia    : " + decide(false) + " (nunca se imprime)");
    }
}
