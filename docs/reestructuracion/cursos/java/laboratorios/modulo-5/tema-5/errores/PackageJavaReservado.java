// Java · M5 · Tema 5 · error 1
// `java.*` esta reservado: javac lo deja compilar, pero la JVM se niega a definir una clase en ese
// prefijo. El fallo es de carga, no de compilacion, y por eso sorprende.
package java.mio;

public class PackageJavaReservado {
    public static void main(String[] args) {
        System.out.println("nunca llega aqui");
    }
}
