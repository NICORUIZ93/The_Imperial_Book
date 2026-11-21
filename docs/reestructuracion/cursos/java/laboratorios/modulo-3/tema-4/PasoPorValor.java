// M3 · Tema 4 · Java pasa valores, siempre: lo que se copia es la referencia, nunca el objeto.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out PasoPorValor
public class PasoPorValor {
    static void intentaCambiarElNumero(int n) { n = 4; }
    static void intentaCambiarLaGuia(String g) { g = "RF-999"; }
    static void reasignaElArreglo(int[] v) { v = new int[] {7, 7}; }
    static void mudaElContenido(int[] v) { v[0] = 7; }

    static class Envio { int gramos; Envio(int g) { gramos = g; } }
    static void cambiaElCampo(Envio e) { e.gramos = 3400; }
    static void reasignaElObjeto(Envio e) { e = new Envio(999); }

    public static void main(String[] args) {
        int n = 10;
        intentaCambiarElNumero(n);
        System.out.println("despues de intentaCambiarElNumero(10): n = " + n);

        String guia = "RF-001";
        intentaCambiarLaGuia(guia);
        System.out.println("despues de intentaCambiarLaGuia: guia = " + guia);

        int[] tanda = {1250, 3400};
        reasignaElArreglo(tanda);
        System.out.println("tras reasignar el arreglo dentro: tanda[0] = " + tanda[0]);
        mudaElContenido(tanda);
        System.out.println("tras mudar el contenido dentro  : tanda[0] = " + tanda[0]);

        Envio e = new Envio(800);
        reasignaElObjeto(e);
        System.out.println("tras reasignar el objeto dentro : e.gramos = " + e.gramos);
        cambiaElCampo(e);
        System.out.println("tras cambiar un campo dentro    : e.gramos = " + e.gramos);
    }
}
