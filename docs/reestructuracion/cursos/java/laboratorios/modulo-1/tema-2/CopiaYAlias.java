// M1 · Tema 2 · ejemplo mínimo: copiar un primitivo copia el valor; copiar una referencia crea un alias.
// Java 25. Ejecuta: java -Dstdout.encoding=UTF-8 CopiaYAlias.java
public class CopiaYAlias {
    public static void main(String[] args) {
        int pesoA = 2500;
        int pesoB = pesoA;        // se copia el número
        pesoB = 9999;
        System.out.println("primitivos:  pesoA = " + pesoA + " · pesoB = " + pesoB);

        StringBuilder notaA = new StringBuilder("frágil");
        StringBuilder notaB = notaA;   // se copia la referencia: un solo objeto, dos nombres
        notaB.append(" · urgente");
        System.out.println("referencias: notaA = " + notaA + " · notaB = " + notaB);
        System.out.println("¿mismo objeto? " + (notaA == notaB));

        StringBuilder notaC = new StringBuilder("frágil · urgente");   // otro objeto con el mismo texto
        System.out.println("¿notaA == notaC? " + (notaA == notaC)
                + " · ¿mismo texto? " + notaA.toString().equals(notaC.toString()));
    }
}
