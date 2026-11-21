// sonda/SondaSinCalificar.java — ¿se puede llamar a readln() sin escribir «IO.» en una clase normal?
// Se espera que NO compile: java.lang.IO está en java.lang (el tipo llega solo) pero sus métodos no.
// Ejecutar (debe fallar): javac --release 25 -encoding UTF-8 -d out sonda/SondaSinCalificar.java
public class SondaSinCalificar {
    public static void main(String[] args) {
        String s = readln();
        System.out.println(s);
    }
}
