// M4 · Tema 5 · Error 3 · El literal tiene que CABER en el primitivo antes de encajarse.
// Java 25. No esta roto a proposito: no compila. Comprueba:
//   javac --release 25 -d out BordeDeByte.java
public class BordeDeByte {
    public static void main(String[] args) {
        Byte chiquito = 127;                      // bien: 127 es el maximo de byte
        Byte desbordado = 128;                    // mal: 128 ya no cabe, ni encajado
        System.out.println(chiquito + " " + desbordado);
    }
}
