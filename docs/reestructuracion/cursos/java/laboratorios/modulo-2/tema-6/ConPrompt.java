// tema-6/ConPrompt.java — readln con prompt: la consola pregunta y espera; sin terminal, el prompt se imprime igual.
// Ejecutar: javac --release 25 -d out tema-6/ConPrompt.java
//           java -Dstdout.encoding=UTF-8 -cp out ConPrompt                (teclado interactivo)
//           printf 'Bogotá\n2500\n' | java -Dstdout.encoding=UTF-8 -cp out ConPrompt   (entrada por tubería)
public class ConPrompt {

    public static void main(String[] args) {
        System.out.println("--- dos preguntas, dos respuestas ---");
        String destino = IO.readln("destino> ");
        System.out.println();
        System.out.println("destino leído      : «" + destino + "»");

        String pesoTexto = IO.readln("peso (g)> ");
        System.out.println();
        System.out.println("peso leído         : «" + pesoTexto + "»");

        if (destino == null || pesoTexto == null) {
            System.out.println("la entrada se acabó antes de las dos respuestas: readln() devolvió null");
            return;
        }

        int peso = Integer.parseInt(pesoTexto.strip());
        System.out.println("etiqueta           : "
                + String.format("%s → %-12s %5d g · %d kg", "Bogotá", destino.strip(), peso, peso / 1000));

        System.out.println("--- readln() sin prompt, ahora con la tercera línea ---");
        String tercera = IO.readln();
        System.out.println("tercera línea      : «" + tercera + "» · null? " + (tercera == null));
    }
}
