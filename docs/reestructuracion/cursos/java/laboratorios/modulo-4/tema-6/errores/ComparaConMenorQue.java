// M4 · Tema 6 · Error 3 · En Java las cadenas NO se comparan con < ni con >: eso es de otros lenguajes.
// Java 25. No esta roto a proposito: no compila. Comprueba:
//   javac --release 25 -d out ComparaConMenorQue.java
public class ComparaConMenorQue {
    public static void main(String[] args) {
        String a = "RF-000123";
        String b = "RF-000124";
        if (a < b) {                              // mal: < solo va con numeros
            System.out.println("primero " + a);
        }
        // bien: if (a.compareTo(b) < 0) ...
    }
}
