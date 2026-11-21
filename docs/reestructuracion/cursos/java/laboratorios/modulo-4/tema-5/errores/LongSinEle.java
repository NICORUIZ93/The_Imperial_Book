// M4 · Tema 5 · Error 2 · Un literal sin L es int: autoboxing lo manda a Integer, nunca a Long.
// Java 25. No esta roto a proposito: no compila. Comprueba:
//   javac --release 25 -d out LongSinEle.java
public class LongSinEle {
    public static void main(String[] args) {
        Long gramos = 100000;                     // mal: 100000 es un int
        Long bien = 100000L;                      // bien: la L lo hace long antes de encajarlo
        System.out.println(gramos + " " + bien);
    }
}
