// tema-6/LectorDeGuias.java — el lector de guías de rutaflow-nucleo: lee líneas hasta el fin de la entrada.
// IO.readln() devuelve null en EOF, así que el bucle se termina solo al redirigir un archivo o una tubería.
// Se valida antes de convertir: comprobar los dígitos evita depender de una excepción (eso llega en su módulo).
// Ejecutar: javac --release 25 -d out tema-6/LectorDeGuias.java
//           java -Dstdout.encoding=UTF-8 -cp out LectorDeGuias < tema-6/datos/guias.txt
public class LectorDeGuias {

    /** true si todos los code points son dígitos y hay al menos uno. */
    static boolean sonDigitos(String texto) {
        if (texto.isEmpty()) {
            return false;
        }
        int p = 0;
        while (p < texto.length()) {
            int cp = texto.codePointAt(p);
            if (!Character.isDigit(cp)) {
                return false;
            }
            p += Character.charCount(cp);
        }
        return true;
    }

    public static void main(String[] args) {
        int leidas = 0;
        int validas = 0;
        StringBuilder informe = new StringBuilder();

        String linea;
        while ((linea = IO.readln()) != null) {
            leidas++;
            String limpia = linea.strip();
            if (limpia.isEmpty()) {
                informe.append("  línea ").append(leidas).append(": vacía, se ignora\n");
                continue;
            }
            String[] campos = limpia.split(";");
            if (campos.length != 3) {
                informe.append("  línea ").append(leidas).append(": «").append(limpia)
                        .append("» trae ").append(campos.length).append(" campos, se esperan 3\n");
                continue;
            }
            String guia = campos[0].strip();
            String destino = campos[1].strip();
            String pesoTexto = campos[2].strip();
            int largo = guia.codePointCount(0, guia.length());
            if (largo != 9) {
                informe.append("  línea ").append(leidas).append(": guía «").append(guia)
                        .append("» tiene ").append(largo).append(" caracteres, se esperan 9\n");
                continue;
            }
            if (!sonDigitos(pesoTexto)) {
                informe.append("  línea ").append(leidas).append(": peso «").append(pesoTexto)
                        .append("» no son solo dígitos\n");
                continue;
            }
            validas++;
            System.out.println("  ok  " + String.format("%-10s %-12s %5d g", guia, destino,
                    Integer.parseInt(pesoTexto)));
        }

        System.out.println("fin de la entrada : readln() devolvió null tras " + leidas + " lecturas");
        System.out.println("válidas           : " + validas + " · descartadas: " + (leidas - validas));
        System.out.print(informe);
    }
}
